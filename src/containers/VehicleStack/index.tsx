/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
//
//  Copyright (c) 2022 Composiv.ai, Eteration A.S. and others
//
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v2.0
// and Eclipse Distribution License v1.0 which accompany this distribution.
//
// The Eclipse Public License is available at
//    http://www.eclipse.org/legal/epl-v10.html
//    and the Eclipse Distribution License is available at
//    http://www.eclipse.org/org/documents/edl-v10.php.
//
// Contributors:
//    Composiv.ai, Eteration A.S. - initial API and implementation
//
//
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
  Alert,
  AlertGroup,
  SearchInput
} from '@patternfly/react-core'

import { useLazyQuery } from '@apollo/client'
import { GETTHINGS } from '../../api/query/vehicle'
import { connect } from '../../common/mqtt'
import { v4 as uuidv4 } from 'uuid'
import VehicleCard from '../VehicleCard'

const VehicleStack = () => {
  const [myuuid] = useState(uuidv4())
  const location = useLocation()
  const [vehicle, setVehicle] = useState(location.state.vehicle)

  const [currentStack, setCurrentStack] = useState(
    vehicle?.features?.stack?.properties?.current?.stackId
  )

  const [stacks, setStacks] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  const [filterValue, setFilterValue] = React.useState('')
  const [getStacksWithIdLike] = useLazyQuery(GETTHINGS, {
    fetchPolicy: 'no-cache'
  })

  const [connectionStatus, setConnectionStatus] = useState(false)
  const [mqttClient, setMqttClient] = useState<any>()

  const addAlert = (title, description, timeout = 5000) => {
    setAlerts((prevAlerts) => {
      return [
        ...prevAlerts,
        <Alert title={title} timeout={timeout} key={uuidv4()}>
          {description}
        </Alert>
      ]
    })
  }

  useEffect(() => {
    const client = connect({
      thingId: vehicle.thingId,
      uuid: myuuid,
      onConnect: () => setConnectionStatus(true),
      onFailed: (err) => !!err && setConnectionStatus(false),
      onMessage: (_topic, payload, _packet) => {
        const resp = JSON.parse(payload?.toString())
        addAlert(
          resp?.result,
          `Completed to publish and stack received: ${resp?.command}`,
          5000
        )
        console.log(payload.toString())
        setTimeout(() => {
          getStacks('*')
        }, 2000)
      }
    })
    setMqttClient(client)
    return () => {
      client.end(true)
    }
  }, [])

  const getStacks = (nameLike) => {
    getStacksWithIdLike({
      variables: {
        filter: `and(eq(definition,"ai.composiv.sandbox.f1tenth:Stack:1.0.0"),like(thingId,"*${nameLike}*"))`
      },
      fetchPolicy: 'no-cache'
    }).then((result) => {
      if (result?.data?.things) {
        setStacks(result?.data?.things.items?.slice(0).reverse())
        console.log('getStacks :', result?.data?.things)
        setTimeout(() => {
          getVehicle()
        }, 500)
      }
    })
  }

  const getVehicle = () => {
    getStacksWithIdLike({
      variables: {
        filter: `and(eq(thingId,"${vehicle?.thingId}"))`
      },
      fetchPolicy: 'no-cache'
    }).then((result) => {
      if (result?.data?.things) {
        setVehicle(result?.data?.things.items[0])
        setCurrentStack(
          result?.data?.things.items[0]?.features?.stack?.properties?.current
            ?.stackId
        )
        console.log('getVehicle :', result?.data?.things)
      }
    })
  }
  useEffect(() => {
    getStacks('*')
  }, [])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
    if (filterValue) getStacks(filterValue)
  }

  const onStackClick = (stack, action) => {
    mqttClient?.publish(
      `${vehicle.thingId}/stack/commands/${action}`,
      JSON.stringify({
        name: stack.name,
        stackId: stack.thingId
      }),
      {
        properties: {
          responseTopic: `db-${vehicle.thingId}/agent/${myuuid}`,
          correlationData: '12333'
        }
      }
    )
  }

  return (
    <>

      {<>
        {connectionStatus && (
          <Label color="green" icon={<i className="pf-icon-connected"></i>}>
            connected to sandbox
          </Label>
        )}
        <AlertGroup isLiveRegion>{alerts}</AlertGroup>
      </>}      {vehicle != null && <VehicleCard vehicle={vehicle} />}
      <Card style={{ textAlign: 'left', margin: '10px' }} component="div" >
        <CardTitle
          style={{
            textAlign: 'center',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            fontWeight: 500,
            background: 'black',
            color: 'white'
          }}
        >
         Stacks
        </CardTitle>
        <CardBody>
          <br />
          <SearchInput
            placeholder="Name includes"
            value={filterValue}
            onChange={onFilterChange}
            onClear={(evt) => onFilterChange('', evt)}
          />

          <DataList aria-label="single action data list example ">
            {stacks.map((stack) => {
              return (
                <DataListItem
                  aria-labelledby="single-action-item1"
                  key={stack.thingId}
                >
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="single-action-item1">{stack.thingId}</span>
                        </DataListCell>,
                        <DataListCell key="secondary content">
                          {stack.features.stack.properties?.name}
                        </DataListCell>
                      ]}
                    />
                    <DataListAction
                      aria-labelledby="single-action-item1 single-action-action1"
                      id="single-action-action1"
                      aria-label="Actions"
                    >
                      {currentStack !== stack.thingId
                        ? (
                          <Label
                            color="blue"
                            onClick={() => {
                              if (
                                confirm(
                                  'This stack will be set as current and paused. Are you sure?'
                                )
                              ) {
                                onStackClick(stack, 'kill')
                              }
                            }}
                            icon={<i className="fas fa-check-circle"></i>}
                          >
                            set
                          </Label>
                          )
                        : (
                          <Label
                            color="grey"
                            icon={<i className="fas fa-check-circle"></i>}
                          >
                            current
                          </Label>
                          )}
                      {currentStack === stack.thingId
                        ? (
                          <Label
                            color="green"
                            onClick={() => {
                              if (
                                confirm(
                                  'This stack will be started and become current. Are you sure?'
                                )
                              ) {
                                onStackClick(stack, 'start')
                              }
                            }}
                            icon={<i className="fas fa-play-circle"></i>}
                          >
                            start
                          </Label>
                          )
                        : null}
                      {currentStack === stack.thingId
                        ? (
                          <Label
                            color="red"
                            onClick={() => {
                              if (
                                confirm(
                                  'This stack will be stopped and become current. Are you sure?'
                                )
                              ) {
                                onStackClick(stack, 'kill')
                              }
                            }}
                            icon={<i className="fas fa-pause-circle"></i>}
                          >
                            stop
                          </Label>
                          )
                        : null}
                    </DataListAction>
                  </DataListItemRow>
                </DataListItem>
              )
            })}
          </DataList>
        </CardBody>
      </Card>
    </>
  )
}

export default VehicleStack

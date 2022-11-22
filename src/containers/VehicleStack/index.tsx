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
  SearchInput,
  Spinner
} from '@patternfly/react-core'
import { useSubscription, useMqttState } from 'mqtt-react-hooks'

import VehicleCard from '../VehicleCard'
import { GetDevice, GetStacksWitdIdLike } from '../../api/query/vehicle'
import { publishCommand, thingTopic } from '../../common/mqtt'

const VehicleStack = () => {
  const { client } = useMqttState()

  const location = useLocation()
  const thingId = location.state?.vehicle?.thingId
  const [targetTopic] = useState<any>(thingTopic(thingId))

  const { message } = useSubscription(`muto/${thingId}`)

  const [stackInProgress, setStackInProgress] = useState()

  const [nameLike, setNameLike] = useState('')
  const { data: sdata, isLoading: isStackListLoading } = GetStacksWitdIdLike({ nameLike })
  const { data: vdata, refetch: refreshDevice } = GetDevice({ thingid: thingId })

  const vehicle = vdata?.data?.items[0] || location.state?.vehicle
  const currentStack = vehicle?.features?.stack?.properties?.current?.stackId

  const stacks:any[] = sdata?.data?.items

  const onFilterChange = (value, _event) => {
    setNameLike(value)
  }

  useEffect(() => {
    if (message) {
      // const payload:any = message?.message
      // const data = JSON.parse(payload)
      setStackInProgress(undefined)
      refreshDevice()
    }
  }, [message])

  const onStackClick = (stack, action) => {
    publishCommand(client, `${location.state?.vehicle?.thingId}/stack/commands/${action}`, targetTopic, {
      name: stack.name,
      stackId: stack.thingId
    })

    setStackInProgress(stack.thingId)
  }

  return (
    <>
      {vehicle != null && <VehicleCard vehicle={vehicle} />}
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
            value={nameLike}
            onChange={onFilterChange}
            onClear={(evt) => onFilterChange('', evt)}
          />
          { isStackListLoading ? <Spinner isSVG size="lg" aria-label="Adding telemetry" /> : null }

          <DataList aria-label="single action data list example ">
            {stacks?.map((stack) => {
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
                      { stackInProgress === stack.thingId ? <Spinner isSVG size="lg" aria-label="Adding telemetry" /> : null}
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
                      {currentStack !== stack.thingId
                        ? (
                          <Label
                            color="orange"
                            onClick={() => {
                              if (
                                confirm(
                                  'This stack will be set as current and paused. Are you sure?'
                                )
                              ) {
                                onStackClick(stack, 'apply')
                              }
                            }}
                            icon={<i className="fas fa-check-circle"></i>}
                          >
                            apply
                          </Label>
                          )
                        : null}
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

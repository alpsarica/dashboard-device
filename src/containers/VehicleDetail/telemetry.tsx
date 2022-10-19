/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Label,
  Card,
  CardBody,
  CardTitle,
  SearchInput,
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  AccordionExpandedContentBody,
  Form,
  FormGroup,
  Popover,
  TextInput,
  ActionGroup,
  Button,
  Grid,
  GridItem,
  Gallery
} from '@patternfly/react-core'
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon'

import { connect } from '../../common/mqtt'
import { v4 as uuidv4 } from 'uuid'
import ReactJson from 'react-json-view'
import { filterList } from '../../common/filter'
import { GETTHINGS } from '../../api/query/vehicle'
import { useLazyQuery } from '@apollo/client'

const VehicleTelemetry = () => {
  const [myuuid] = useState(uuidv4())
  const [connectionStatus, setConnectionStatus] = useState(false)
  const location = useLocation()

  const [rate, setRate] = useState(location.state?.definition?.rate)
  const [target, setTarget] = useState(location.state?.definition?.target?.topic)

  const [vehicle, setVehicle] = useState(location.state?.vehicle)
  const [client, setClient] = useState<any>()
  const [newDefinition, setNewDefinition] = useState(location.state?.definition)
  const [targetTopic] = useState(`db-${vehicle.thingId}/agent/${myuuid}`)
  const [getStacksWithIdLike] = useLazyQuery(GETTHINGS, {
    fetchPolicy: 'no-cache'
  })

  const [telemetryList, setTelemetryList] = useState(vehicle?.features?.telemetry?.properties?.definition)
  const [telemetryData, setTelemetryData] = useState({})

  const [filterValue, setFilterValue] = useState('')

  const [expanded, setExpanded] = React.useState('')

  const galleryStyle:any = { '--pf-l-gallery--GridTemplateColumns--min': '260px' }

  const showTelemetry = (_topic, payload, _packet) => {
    for (let index = 0; index < telemetryList?.length; index++) {
      const t = telemetryList[index]
      if (t.target.topic === _topic) {
        console.log(JSON.parse(payload.toString()))
        telemetryData[_topic] = JSON.parse(payload.toString())
        setTelemetryData(telemetryData)
        return true
      }
    }
    return false
  }
  useEffect(() => {
    const cl = connect({
      thingId: vehicle.thingId,
      uuid: myuuid,
      onConnect: () => setConnectionStatus(true),
      onFailed: (err) => !!err && setConnectionStatus(false),
      onMessage: (_topic, payload, _packet) => {
        if (_topic !== targetTopic) return
        const data:any = JSON.parse(payload.toString())
        if (data?.status === 'STOPPED' || data?.status === 'DELETED') {
          setTelemetryData({})
        }
        getStacksWithIdLike({
          variables: {
            filter: `and(eq(thingId,"${vehicle?.thingId}"))`
          },
          fetchPolicy: 'no-cache'
        }).then((result) => {
          if (result?.data?.things && result?.data?.things.items.length > 0) {
            const theVehicle = result.data.things.items[0]
            const tList = theVehicle.features?.telemetry?.properties?.definition
            setVehicle(theVehicle)
            setTelemetryList(tList)
            setNewDefinition(undefined)
          }
        })
      }
    })
    setClient(cl)
    doTelemetry(cl, undefined, 'reset')
    return () => {
      doTelemetry(cl, undefined, 'stop')
      !!cl && cl.end(true)
    }
  }, [])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
  }

  const onToggle = (id) => {
    if (id === 'expanded') {
      setExpanded('')
    } else {
      setExpanded(id)
    }
  }

  const stopAll = () => {
    telemetryList?.forEach(telemetry => {
      doTelemetry(client, telemetry, 'stop')
    })
  }
  const doTelemetry = (client, telemetry, action) => {
    if (telemetry) {
      client.publish(
        `${vehicle.thingId}/agent/commands/ros/topic/echo`,
        JSON.stringify({
          topic: telemetry.topic,
          action,
          rate: telemetry.rate,
          target: {
            topic: telemetry.target.topic,
            correlation: telemetry.target.correlation
          }
        }),
        {
          properties: {
            responseTopic: targetTopic,
            correlationData: myuuid
          }
        }
      )
      if (action === 'start') {
        client.subscribe(telemetry.target.topic, (err) => {
          console.log(err)
        })
        client.on('message', showTelemetry)
      }
    }
  }

  const handleRateChange = (trate: number) => {
    setRate(trate)
  }
  const handleTargetChange = (name: string) => {
    setTarget(name)
    if (newDefinition) { newDefinition.target.topic = name }
  }

  const addTelemetery = () => {
    if (newDefinition) {
      newDefinition.rate = rate
      newDefinition.target.topic = target
      doTelemetry(client, newDefinition, 'register')
    }
  }

  return (
    <>
      {connectionStatus && <Label color="green" icon={<i className="pf-icon-connected"></i>} >connected to sandbox</Label>}
      {!!newDefinition && <Card style={{ textAlign: 'left', margin: '10px', padding: '20px' }} component="div" >

        <Form>
          <FormGroup label="Topic name" fieldId="simple-form-note-01">
            <TextInput isDisabled type="text" id="simple-form-note-01" name="simple-form-number" value={newDefinition?.topic} />
          </FormGroup>
          <FormGroup
            label="Rate(ms)"
            labelIcon={
              <Popover
                headerContent={
                  <div>
                    The number of milliseconds between each message published. (i.e. 1000ms for a second)
                  </div>
                }
                bodyContent={
                  <div>
                    Milli seconds between each message.
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for name field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="simple-form-name-01"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="simple-form-name-01"
            helperText="Milliseconds between each message."
          >
            <TextInput
              isRequired
              type="number"
              id="simple-form-name-01"
              name="simple-form-name-01"
              aria-describedby="simple-form-name-01-helper"
              value={rate}
              onChange={handleRateChange}
            />
          </FormGroup>
          <FormGroup
            label="Target mqtt channnel"
            labelIcon={
              <Popover
                headerContent={
                  <div>
                    The name of the mqtt channel where this information will be published
                  </div>
                }
                bodyContent={
                  <div>
                    Typically starts with the thingId/telemetry/ followed by a unique path.
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for name field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="simple-form-name-01"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="simple-form-name-01"
            helperText="Typically starts with the thingId/telemetry/ followed by a unique path identifying the topic and other selectors e.g: 'ai.composiv.sandbox.f1tenth:mycar/telemetry/atopic/abcd-1234-efgh'."
          >
            <TextInput
              isRequired
              type="text"
              id="simple-form-name-01"
              name="simple-form-name-01"
              aria-describedby="simple-form-name-01-helper"
              value={target}
              onChange={handleTargetChange}
            />
          </FormGroup>
          <ActionGroup>
            <Button variant="primary" onClick={_e => addTelemetery()}>Add Telemetry</Button>
          </ActionGroup>
        </Form>
      </Card>}
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
          {`Telemetry definitions for ${vehicle?.thingId}`}
          &nbsp; <Label color="orange" onClick={() => { stopAll() }} icon={<i className="fas fa-pause-circle"></i>}>stop all</Label>
        </CardTitle>
        <CardBody>
          <br />
          <SearchInput
            placeholder="Topic includes"
            value={filterValue}
            onChange={onFilterChange}
            onClear={(evt) => onFilterChange('', evt)}
          />
          <br />
          <Accordion isBordered displaySize="default">
            {!!telemetryList &&
              filterList(telemetryList, 'topic', filterValue).map(
                (telemetry, index) => {
                  return (
                    <AccordionItem key={index}>
                      <AccordionToggle
                        onClick={() => {
                          expanded === `bordered-toogle${index}`
                            ? onToggle('')
                            : onToggle(`bordered-toogle${index}`)
                        }}
                        isExpanded={expanded === `bordered-toogle${index}`}
                        id={`bordered-toogle${index}`}
                      >
                        {telemetry.topic}
                      </AccordionToggle>
                      <AccordionContent
                        id={`bordered-toogle${index}`}
                        isHidden={expanded !== `bordered-toogle${index}`}
                        isCustomContent
                      >
                        <AccordionExpandedContentBody>
                          <Label color="green" onClick={() => { doTelemetry(client, telemetry, 'start') }} icon={<i className="fas fa-play-circle"></i>}>start</Label>
                          <Label color="orange" onClick={() => { doTelemetry(client, telemetry, 'stop') }} icon={<i className="fas fa-pause-circle"></i>}>stop</Label>
                          <Label color="red" onClick={() => { doTelemetry(client, telemetry, 'delete') }} icon={<i className="fas fa-times-circle"></i>}>delete</Label>
                          <ReactJson name={false} src={telemetry} />
                        </AccordionExpandedContentBody>
                      </AccordionContent>
                    </AccordionItem>
                  )
                }
              )}
          </Accordion>
        </CardBody>
      </Card>
      <Grid hasGutter>
          <GridItem>
            <Gallery
              hasGutter
              style={ galleryStyle }>
              {!!telemetryData && Object.keys(telemetryData).map((k, i) => {
                return <Card style={{ textAlign: 'left', margin: '10px' }} component="div" >
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
                  >{k}</CardTitle>
                  <CardBody>
                    <ReactJson name={false} src={telemetryData[k]} />
                  </CardBody>
                </Card>
              })}
            </Gallery>
          </GridItem>
          ;
        </Grid>
    </>
  )
}

export default VehicleTelemetry

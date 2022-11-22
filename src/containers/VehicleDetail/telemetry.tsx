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
  Gallery,
  Spinner
} from '@patternfly/react-core'
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon'
import { useMqttState, useSubscription } from 'mqtt-react-hooks'

import ReactJson from 'react-json-view'
import { filterList } from '../../common/filter'
import { GetDevice } from '../../api/query/vehicle'
import { publishCommand, thingTopic } from '../../common/mqtt'

const TelemetryForm = ({ definition, onSubmit, loading }) => {
  const [rate, setRate] = useState(definition?.rate)
  const [target, setTarget] = useState(definition?.target?.topic)

  const handleRateChange = (trate: string, _event) => {
    setRate(parseInt(trate))
  }
  const handleTargetChange = (name: string, _event) => {
    setTarget(name)
  }

  const addTelemetery = () => {
    if (definition) {
      definition.rate = rate
      definition.target.topic = target
      onSubmit(definition, 'register')
    }
  }
  return definition
    ? (!loading
        ? (
        <Card style={{ textAlign: 'left', margin: '10px' }} component="div"><CardBody><Form>
          <FormGroup label="Topic name" fieldId="simple-form-note-01">
            <TextInput isDisabled type="text" id="simple-form-note-01" name="simple-form-number" value={definition?.topic} />
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
            helperText="Typically starts with the thingId/telemetry/ followed by a unique path identifying the topic and other selectors e.g: 'org.eclipse.muto:mycar/telemetry/atopic/abcd-1234-efgh'."
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
        </Form></CardBody>
        </Card>)
        : <Spinner isSVG size="xl" aria-label="Adding telemetry" />)
    : null
}

const TelemetryWidget = ({ telemetry }) => {
  console.log(telemetry?.target?.topic)

  const { message } = useSubscription([telemetry?.target?.topic])
  const [payload, setPayload] = useState({})

  useEffect(() => {
    if (message) {
      const str: any = message?.message
      if (str) {
        const pl = JSON.parse(str)
        setPayload(pl)
      }
    }
  }, [message])

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
    >{telemetry.topic}</CardTitle>
    <CardBody>
      <ReactJson name={false} src={payload} />
    </CardBody>
  </Card>
}

const VehicleTelemetry = () => {
  const location = useLocation()

  const [vehicle, setVehicle] = useState(location.state?.vehicle)
  const [newDefinition, setNewDefinition] = useState(location.state?.definition)
  const [telemetryList, setTelemetryList] = useState(vehicle?.features?.telemetry?.properties?.definition)
  const [vehicleTopic] = useState(thingTopic(location.state?.vehicle?.thingId))
  const { client } = useMqttState()

  const [filterValue, setFilterValue] = useState('')
  const [expanded, setExpanded] = useState('')
  const [subscriptionList, setSubscriptionList] = useState<object>({})

  const { message } = useSubscription([`muto/${location.state?.vehicle?.thingId}`])

  const { data: device, isFetching: loading, refetch } = GetDevice({ thingid: vehicle?.thingId })

  const galleryStyle: any = { '--pf-l-gallery--GridTemplateColumns--min': '260px' }

  useEffect(() => {
    if (device?.data?.items && device?.data?.items.length > 0) {
      const theVehicle = device.data.items[0]
      const tList = theVehicle.features?.telemetry?.properties?.definition
      setVehicle(theVehicle)
      setTelemetryList(tList)
    }
    if (!device) {
      refetch()
    }
  }, [device])

  useEffect(() => {
    doTelemetry(undefined, 'reset')
    return () => {
      doTelemetry(undefined, 'stop')
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
    setSubscriptionList({})
    telemetryList?.forEach(telemetry => {
      doTelemetry(telemetry, 'stop')
    })
  }
  useEffect(() => {
    if (message) {
      if (message?.topic === `muto/${location.state?.vehicle?.thingId}`) {
        refetch()
      } else if (message?.topic === vehicleTopic?.topic) {
        for (let index = 0; index < telemetryList?.length; index++) {
          const t = telemetryList[index]
          if (t.target.topic === message?.topic) {
            const payload: any = message?.message
            try {
              console.log(JSON.parse(payload))
            } catch (e) { }
          }
        }
      }
    }
  }, [message])

  const doTelemetry = (telemetry, action) => {
    if (client && telemetry) {
      publishCommand(client, `${vehicle.thingId}/agent/commands/ros/topic/echo`, telemetry.target, {
        topic: telemetry.topic,
        action,
        rate: telemetry.rate
      })
      if (action === 'start') {
        subscriptionList[telemetry.topic] = telemetry
        setSubscriptionList({ ...subscriptionList })
      }
      if (action === 'stop') {
        if (Object.prototype.hasOwnProperty.call(subscriptionList, telemetry.topic)) { delete subscriptionList[telemetry.topic] }
      }
    }
  }

  return (
    <>
      <TelemetryForm definition={newDefinition} loading={loading} onSubmit={(tel, action) => {
        doTelemetry(tel, action)
        setNewDefinition(undefined)
      }} />
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

          {loading
            ? <Spinner isSVG size="xl" aria-label="Getting telemetry" />
            : <Accordion isBordered displaySize="default">
              {!!telemetryList && filterList(telemetryList, 'topic', filterValue).map(
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
                          <Label color="green" onClick={() => { doTelemetry(telemetry, 'start') }} icon={<i className="fas fa-play-circle"></i>}>start</Label>
                          <Label color="orange" onClick={() => { doTelemetry(telemetry, 'stop') }} icon={<i className="fas fa-pause-circle"></i>}>stop</Label>
                          <Label color="red" onClick={() => { doTelemetry(telemetry, 'delete') }} icon={<i className="fas fa-times-circle"></i>}>delete</Label>
                          <ReactJson name={false} src={telemetry} />
                        </AccordionExpandedContentBody>
                      </AccordionContent>
                    </AccordionItem>
                  )
                }
              )}
            </Accordion>}
        </CardBody>
      </Card>
      <Grid hasGutter>
        <GridItem>
          <Gallery
            hasGutter
            style={galleryStyle}>
            {Object.values(subscriptionList).map((val, _i) => { return <TelemetryWidget telemetry={val} /> })}
          </Gallery>
        </GridItem>
        ;
      </Grid>
    </>
  )
}

export default VehicleTelemetry

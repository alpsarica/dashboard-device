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
import { useLocation, useHistory } from 'react-router-dom'
import {
  Label,
  SearchInput,
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  AccordionExpandedContentBody,
  Card,
  CardBody,
  CardTitle
} from '@patternfly/react-core'

import { useSubscription, useMqttState } from 'mqtt-react-hooks'
import { thingTopic, publishCommand } from '../../../common/mqtt'

import { filterList } from '../../../common/filter'
import VehicleCard from '../../VehicleCard'
import ReactJson from 'react-json-view'
import { v4 as uuidv4 } from 'uuid'

const TopicList = () => {
  const [topicList, setTopicList] = useState(null)
  const [filterValue, setFilterValue] = useState('')
  const [expanded, setExpanded] = React.useState('')
  const [nodeCommandCorrelationId, setNodeCommandCorrelationId] = React.useState('')

  const location = useLocation()
  const navigation = useHistory()

  const [vehicle] = useState(location.state?.vehicle)

  const displaySize = 'default'
  const onToggle = (id) => {
    if (id === 'expanded') {
      setExpanded('')
    } else {
      setExpanded(id)
    }
  }

  const [targetTopic] = useState<any>(thingTopic(vehicle?.thingId))
  const { message } = useSubscription(`muto/${vehicle.thingId}`)
  const { client } = useMqttState()

  useEffect(() => {
    if (client) {
      getTopics()
    }
  }, [client])

  useEffect(() => {
    if (message && nodeCommandCorrelationId) {
      const payload:any = message?.message
      const data = JSON.parse(payload)
      if (
        (data.headers['correlation-data'] === nodeCommandCorrelationId) &&
        (data.path.startsWith('/outbox'))
      ) {
        const topics = JSON.parse(data.value)
        analyzeResponse(topics)
      }
    }
  }, [message, nodeCommandCorrelationId])

  // useEffect(() => {
  //   if (message) {
  //     const payload:any = message?.message
  //     const data = JSON.parse(payload)
  //     analyzeResponse(data)
  //   }
  // }, [message])

  const getTopics = async () => {
    const correlationId = await publishCommand(client, vehicle.thingId, 'agent/commands/ros/topic')
    setNodeCommandCorrelationId(correlationId)
  }

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
  }

  const analyzeResponse = (response) => {
    const topics: any = []

    if (response?.subs && response?.pubs) {
      response.pubs.map((topic) => {
        topics.push({
          name: topic[0],
          type: topic[1],
          publishers: topic[2]
        })
      })

      // eslint-disable-next-line array-callback-return
      response.subs.map((topic) => {
        const existTopic = topics.find((t) => t.name === topic[0])
        if (existTopic) {
          existTopic.subscribers = topic[2]
        } else {
          topics.push({
            name: topic[0],
            type: topic[1],
            subscribers: topic[2]
          })
        }
      })
      setTopicList(topics)
    }
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
          {`Topics for ${vehicle?.thingId.split(':')[1]}`}
        </CardTitle>
        <CardBody>
          <br />
          <SearchInput
            placeholder="Name includes"
            value={filterValue}
            onChange={onFilterChange}
            onClear={(evt) => onFilterChange('', evt)}
          />
          <br />
          <Accordion isBordered displaySize={displaySize}>
            {topicList != null &&
              filterList(topicList, 'name', filterValue).map(
                (topic, index) => {
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
                        {topic.name} &nbsp; <Label
                            color="green"
                            onClick={() => {
                              const tid = uuidv4()
                              navigation.push({
                                pathname: `/vehicle/${vehicle?.thingId}/telemetry`,
                                state: {
                                  vehicle,
                                  topic,
                                  definition: {
                                    topic: topic?.name,
                                    rate: 10000,
                                    target: {
                                      topic: `${vehicle.thingId}/telemetry${topic?.name}/${tid}`,
                                      correlation: tid
                                    }
                                  }
                                }
                              })
                            }}
                            icon={<i className="fas fa-podcast"></i>}
                          >
                            echo
                          </Label><br />
                      </AccordionToggle>
                      <AccordionContent
                        id={`bordered-toogle${index}`}
                        isHidden={expanded !== `bordered-toogle${index}`}
                        isCustomContent
                      >
                        <AccordionExpandedContentBody>
                          <ReactJson name={false} src={topic} />
                        </AccordionExpandedContentBody>
                      </AccordionContent>
                    </AccordionItem>
                  )
                }
              )}
        </Accordion>
      </CardBody>
    </Card>
    </>
  )
}

export default TopicList

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

import { connect } from '../../../common/mqtt'
import { filterList } from '../../../common/filter'
import { v4 as uuidv4 } from 'uuid'
import VehicleCard from '../../VehicleCard'
import ReactJson from 'react-json-view'

const TopicList = () => {
  const [myuuid] = useState(uuidv4())
  const [connectionStatus, setConnectionStatus] = useState(false)
  const [topicList, setTopicList] = useState(null)
  const [filterValue, setFilterValue] = useState('')

  const [expanded, setExpanded] = React.useState('')

  const location = useLocation()
  const navigation = useHistory()

  const [vehicle] = useState(location.state?.vehicle)
  const [targetTopic] = useState(`db-${vehicle.thingId}/agent/${myuuid}`)

  const displaySize = 'default'
  const onToggle = (id) => {
    if (id === 'expanded') {
      setExpanded('')
    } else {
      setExpanded(id)
    }
  }

  useEffect(() => {
    const client = connect({
      thingId: vehicle.thingId,
      uuid: myuuid,
      onConnect: () => setConnectionStatus(true),
      onFailed: (err) => !!err && setConnectionStatus(false),
      onMessage: (_topic, payload, _packet) => {
        const data = JSON.parse(payload.toString())
        analyzeResponse(data)
      }
    })
    getTopics(client)
    console.log(vehicle)
    return () => {
      client.end(true)
    }
  }, [])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
  }

  const analyzeResponse = (response) => {
    const topics: any = []

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
    console.log(topics)
    setTopicList(topics)
  }

  const getTopics = (client) => {
    client.publish(
      `${vehicle.thingId}/agent/commands/ros/topic`,
      JSON.stringify({
        target: {
          topic: targetTopic,
          correlation: myuuid
        }
      }),
      {
        properties: {
          responseTopic: targetTopic,
          correlationData: myuuid
        }
      }
    )
  }

  return (
    <>
      {connectionStatus && <Label color="green" icon={<i className="pf-icon-connected"></i>} >connected to sandbox</Label>}
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
                              navigation.push({
                                pathname: `/vehicle/${vehicle?.thingId}/echo`,
                                state: { vehicle, topic }
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

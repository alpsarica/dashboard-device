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
import {
  Card,
  SearchInput,
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  AccordionExpandedContentBody,
  CardTitle,
  CardBody
} from '@patternfly/react-core'
import { useLocation } from 'react-router-dom'
import { useSubscription, useMqttState } from 'mqtt-react-hooks'
import { filterList } from '../../../common/filter'
import VehicleCard from '../../VehicleCard'
import ReactJson from 'react-json-view'
import { thingTopic, publishCommand } from '../../../common/mqtt'

const RosNodeList = () => {
  const [nodes, setNodeNames] = useState<any>()
  const [filterValue, setFilterValue] = React.useState('')

  const location = useLocation()
  const [vehicle] = useState(location.state?.vehicle)
  const [targetTopic] = useState<any>(thingTopic(vehicle?.thingId))
  const [expanded, setExpanded] = React.useState('')
  const [nodeCommandCorrelationId, setNodeCommandCorrelationId] = React.useState('')

  const { message } = useSubscription(`muto/${vehicle.thingId}`)
  const { client } = useMqttState()

  const displaySize = 'default'
  const onToggle = (id) => {
    if (id === 'expanded') {
      setExpanded('')
    } else {
      setExpanded(id)
    }
  }

  useEffect(() => {
    if (client) {
      getNodes()
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
        const nodes = JSON.parse(data.value).nodes
        setNodeNames(nodes)
      }
    }
  }, [message, nodeCommandCorrelationId])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
  }

  const getNodes = async () => {
    const correlationId = await publishCommand(client, vehicle.thingId, 'agent/commands/ros/node')
    setNodeCommandCorrelationId(correlationId)
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
          {`Nodes for ${vehicle?.thingId.split(':')[1]}`}
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
            {nodes != null &&
              filterList(nodes, 'name', filterValue).map((node, index) => {
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
                      {node.name}
                    </AccordionToggle>
                    <AccordionContent
                      id={`bordered-toogle${index}`}
                      isHidden={expanded !== `bordered-toogle${index}`}
                      isCustomContent
                    >
                      <AccordionExpandedContentBody>
                        <ReactJson name={node.name} src={node.info} />
                      </AccordionExpandedContentBody>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
          </Accordion>
        </CardBody>
      </Card>
    </>
  )
}

export default RosNodeList

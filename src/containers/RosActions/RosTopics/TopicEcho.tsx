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
  CardTitle
} from '@patternfly/react-core'

import { connect } from '../../../common/mqtt'
import { v4 as uuidv4 } from 'uuid'
import ReactJson from 'react-json-view'

const TopicEcho = () => {
  const [myuuid] = useState(uuidv4())
  const [connectionStatus, setConnectionStatus] = useState(false)
  const location = useLocation()
  const [vehicle] = useState(location.state?.vehicle)
  const [client, setClient] = useState<any>()
  const [topic] = useState(location.state?.topic)
  const [targetTopic] = useState(`db-${vehicle.thingId}/agent/${myuuid}`)
  const [topicEcho, setEcho] = useState({})

  useEffect(() => {
    const cl = connect({
      thingId: vehicle.thingId,
      uuid: myuuid,
      onConnect: () => setConnectionStatus(true),
      onFailed: (err) => !!err && setConnectionStatus(false),
      onMessage: (_topic, payload, _packet) => {
        const data = JSON.parse(payload.toString())
        setEcho(data)
      }
    })
    setClient(cl)
    startEcho(cl, topic?.name ? 'start' : 'reset')
    console.log(vehicle)
    return () => {
      startEcho(cl, 'stop')
      !!cl && cl.end(true)
    }
  }, [])

  const startEcho = (client, action) => {
    client.publish(
      `${vehicle.thingId}/agent/commands/ros/topic/echo`,
      JSON.stringify({
        topic: topic?.name,
        action,
        rate: 10000,
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
          {`Topic echo ${topic?.name}`}  &nbsp;
          <Label color="green" onClick={() => { startEcho(client, 'start') }} icon={<i className="fas fa-play-circle"></i>}>start</Label>
          &nbsp; <Label color="orange" onClick={() => { startEcho(client, 'stop') }} icon={<i className="fas fa-pause-circle"></i>}>stop</Label>
          &nbsp; <Label color="red" onClick={() => { startEcho(client, 'reset') }} icon={<i className="fas fa-times-circle"></i>}>delete all</Label>
        </CardTitle>
        <CardBody>
          <br />
          <ReactJson name={false} src={topicEcho} />
        </CardBody>
      </Card>
    </>
  )
}

export default TopicEcho

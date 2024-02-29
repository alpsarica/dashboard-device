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
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

export function thingTopic(thing) {
  const correlation = uuidv4()
  const topic = `db-${thing}/agent/${correlation}`
  return { topic, correlation }
}

export function publishCommand(client, topic, target, payload) {
  client.publish(
    topic,
    JSON.stringify({
      ...payload,
      target
    }),
    {
      properties: {
        responseTopic: target.topic,
        correlationData: target.correlation
      }
    })
}

export function ping(client, thing, response) {
  const correlationId = uuidv4()
  if (!client || !thing) return
  const ttopic = `ping-${thing}/agent/${correlationId}`
  client.subscribe(ttopic, (_err) => { })
  client.on('message', (topic, payload, packet) => {
    if (topic === ttopic) {
      response(topic, payload, packet)
      client.unsubscribe(ttopic)
    }
  })
  client.publish(
    `${thing}/agent/commands/foo/bar`, JSON.stringify({
      foo: 'bar',
      target: {
        topic: ttopic,
        correlation: correlationId
      }
    }),
    {
      properties: {
        responseTopic: ttopic,
        correlationData: correlationId
      }
    })
}

export function ping2(client, thing, response) {
  const thingSplitted = thing.split(':')
  const thingNamespace = thingSplitted[0]
  const thingId = thingSplitted[1]

  const thingTopic = `muto/${thing}`
  const correlationId = uuidv4()

  const payload = {
    topic: `${thingNamespace}/${thingId}/things/live/messages/agent/commands/ping`,
    headers: {
      'content-type': 'application/json',
      'correlation-data': correlationId
    },
    path: '/inbox/messages/agent/commands/ping',
    value: ''
  }

  if (!client || !thing) return

  client.unsubscribe(thingTopic)
  client.subscribe(thingTopic, (_err) => { })
  client.on('message', (topic, payload, packet) => {
    const payloadJSON = JSON.parse(payload)
    if (
      (thingTopic === topic) &&
      (correlationId == payloadJSON.headers["correlation-data"]) &&
      (payloadJSON.path.startsWith("/outbox"))
    ) {
      response(topic, payload, packet)
      client.unsubscribe(thingTopic)
    }
  })
  client.publish(thingTopic, JSON.stringify(payload))
}


export function ping3(client, thing, response) {
  const thingSplitted = thing.split(':')
  const thingNamespace = thingSplitted[0]
  const thingId = thingSplitted[1]

  const url = `https://sandbox.composiv.ai/api/2/things/${thingNamespace}:${thingId}/inbox/messages/agent/commands/ping`
  const data = {}
  const config = {
    auth: {
      username: 'ditto',
      password: 'ditto'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  axios.post(url, data, config)
}

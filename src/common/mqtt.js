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
import mqtt from 'mqtt/dist/mqtt'
import { v4 as uuidv4 } from 'uuid'

const SANDBOX_URL = 'wss://sandbox.composiv.ai:443/ws'

export function connect ({ thingId, onConnect, onFailed, onMessage }) {
  const correlationId = uuidv4()
  const targetTopic = `db-${thingId}/agent/${correlationId}`

  const client = mqtt.connect(SANDBOX_URL, { protocolVersion: 5 })
  client.on('error', (err) => { onFailed(err) })
  client.on('connect', (a) => {
    onConnect()
    client.subscribe(targetTopic, (_err) => {})
    client.on('message', (topic, payload, packet) => {
      onMessage(topic, payload, packet)
    })
  })

  return {
    client,
    targetTopic,
    correlationId,
    publish: (topic, payload) => {
      client.publish(
        topic,
        JSON.stringify({
          ...payload,
          target: {
            topic: targetTopic,
            correlation: correlationId
          }
        }),
        {
          properties: {
            responseTopic: targetTopic,
            correlationData: correlationId
          }
        })
    },
    ping: (thing, response) => {
      const ttopic = `ping-${thing}/agent/${correlationId}`
      client.subscribe(ttopic, (_err) => {})
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
  }
}

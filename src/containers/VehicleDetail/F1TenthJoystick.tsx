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
import React, { useState } from 'react'

import {
  ToggleGroup, ToggleGroupItem
} from '@patternfly/react-core'

import { Joystick } from 'react-joystick-component'
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick'

const F1TenthJoyStick = ({ vehicle, client }) => {
  const [mux, setMux] = useState<any>('reset')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_joyeevent, setJoyEvent] = useState<IJoystickUpdateEvent>()

  const doRemoteControl = (event) => {
    const c: any = client
    if (client && event) {
      c.publish(
        `${vehicle.thingId}/agent/commands/bcx/rc`,
        {
          control: event?.control || 'reset',
          type: event?.type,
          direction: event?.direction,
          x: event?.x || 0,
          y: event?.y || 0
        }
      )
    }
  }
  const handleMove = (event: IJoystickUpdateEvent) => {
    // if (joyeevent?.type !== event.type || joyeevent?.direction !== event.direction) {
    setJoyEvent(event)
    doRemoteControl({ control: mux, ...event })
    // }
  }
  const handleStop = (event: IJoystickUpdateEvent) => {
    // if (joyeevent?.type !== event.type || joyeevent?.direction !== event.direction) {
    console.log(event)
    setJoyEvent(event)
    doRemoteControl(event)
    // }
  }

  const handleMuxToggle = (isSelected, event) => {
    const id = event.currentTarget.id
    console.log(isSelected, id)
    doRemoteControl({
      control: id,
      type: 'stop',
      direction: 'none',
      x: 0,
      y: 0
    })
    setMux(id)
  }
  const f1tenthsim = vehicle && vehicle?.attributes?.brand === 'f1tenth.org' && vehicle?.attributes?.model === 'f1tenthsimulation'

  if (!f1tenthsim) { return null }

  return (f1tenthsim && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Joystick size={200} stickSize={50} sticky={false} baseColor="#cabdfe" stickColor="#781c76" move={handleMove} stop={handleStop}></Joystick>
    <br />
    <ToggleGroup aria-label="Default with multiple selectable">
      <ToggleGroupItem text="Joystick" key={1} buttonId="joystick" isSelected={mux === 'joystick'} onChange={handleMuxToggle} />
      <ToggleGroupItem text="Autopilot" key={2} buttonId="navigator" isSelected={mux === 'navigator'} onChange={handleMuxToggle} />
      <ToggleGroupItem text="Fullstop" key={3} buttonId="reset" isSelected={mux === 'reset'} onChange={handleMuxToggle} />
    </ToggleGroup>
  </div>)
}

export default F1TenthJoyStick

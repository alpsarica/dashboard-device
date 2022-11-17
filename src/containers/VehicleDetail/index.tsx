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
import F1TenthJoyStick from './F1TenthJoystick'

import {
  Card,
  CardBody
} from '@patternfly/react-core'
import VehicleCard from '../VehicleCard'
import { useLocation, useParams } from 'react-router-dom'
import { GETTHINGS } from '../../api/query/vehicle'
import { useLazyQuery } from '@apollo/client'

import { connect } from '../../common/mqtt'

const VehicleDetail = () => {
  const location = useLocation()
  const params = useParams()
  const [connectionStatus, setConnectionStatus] = useState<any>(false)
  const [client, setClient] = useState<any>()
  const [vehicle, setVehicle] = useState(location.state?.vehicle)
  const [getStacksWithIdLike] = useLazyQuery(GETTHINGS, {
    fetchPolicy: 'no-cache'
  })

  const getVehicle = () => {
    getStacksWithIdLike({
      variables: {
        filter: `and(eq(thingId,"${params?.thingid}"))`
      },
      fetchPolicy: 'no-cache'
    }).then((result) => {
      if (result?.data?.things) {
        setVehicle(result?.data?.things.items[0])
      }
    })
  }

  useEffect(() => {
    if (vehicle?.thingId) {
      const c = connect({
        thingId: vehicle?.thingId,
        onConnect: () => setConnectionStatus(true),
        onFailed: (err) => !!err && setConnectionStatus(false),
        onMessage: (_topic, _payload, _packet) => {

        }
      })
      setClient(c)
      return () => {
        c.client.end(true)
      }
    }
    return ()=>{}
  }, [vehicle])

  useEffect(() => {
    if (!vehicle) {
      getVehicle()
    }
  }, [])

  return (
    <div>
      {vehicle != null && <VehicleCard vehicle={vehicle} client={client} connectionStatus={connectionStatus} />}

      <Card
        style={{
          textAlign: 'center',
          margin: 20
        }}
        component="div"
      >
        <CardBody>
          <F1TenthJoyStick vehicle={vehicle} client={client} />
        </CardBody>
        <br />
      </Card>
    </div>
  )
}

export default VehicleDetail

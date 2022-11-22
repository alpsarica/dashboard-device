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
  CardBody,
  Spinner
} from '@patternfly/react-core'
import VehicleCard from '../VehicleCard'
import { useLocation, useParams } from 'react-router-dom'
import { GetDevice } from '../../api/query/vehicle'

const VehicleDetail = () => {
  const location = useLocation()
  const params = useParams()
  const [vehicle, setVehicle] = useState(location.state?.vehicle)
  const { data, isLoading, refetch } = GetDevice({ thingid: params?.thingid })

  useEffect(() => {
    refetch()
    return () => {}
  }, [])

  useEffect(() => {
    if (!vehicle || data?.data?.items) {
      if (data?.data?.items) {
        setVehicle(data?.data?.items[0])
      }
    }
  }, [data])

  return (
    <div>
      {vehicle ? <VehicleCard vehicle={vehicle} /> : (isLoading ? <Spinner isSVG size="xl" aria-label="Adding telemetry" /> : null)}

      <Card
        style={{
          textAlign: 'center',
          margin: 20
        }}
        component="div"
      >
        <CardBody>
          <F1TenthJoyStick vehicle={vehicle} />
        </CardBody>
        <br />
      </Card>
    </div>
  )
}

export default VehicleDetail

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

  OverflowMenu,
  OverflowMenuContent,
  OverflowMenuGroup,
  OverflowMenuItem,
  CardBody,
  Label
} from '@patternfly/react-core'
import VehicleCard from '../VehicleCard'
import { useLocation, useParams, useHistory } from 'react-router-dom'
import { GETTHINGS } from '../../api/query/vehicle'
import { useLazyQuery } from '@apollo/client'

const MenuButton = ({ onClick, faicon, label }) => (<Label color="blue" onClick={onClick} icon={<i className={`fas ${faicon}`}></i>}>{label}</Label>)

const VehicleDetail = () => {
  const location = useLocation()
  const params = useParams()
  const navigation = useHistory()
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
        console.log('getVehicle :', result?.data?.things)
      }
    })
  }

  useEffect(() => {
    if (!vehicle) {
      getVehicle()
    }
  }, [])

  return (
    <div>
      {vehicle != null && <VehicleCard vehicle={vehicle} />}

      <Card
        style={{
          textAlign: 'center',
          margin: 20
        }}
        component="div"
      >
        <CardBody>
          <OverflowMenu breakpoint="sm">
            <OverflowMenuContent isPersistent>
              <OverflowMenuGroup groupType="button">
                <OverflowMenuItem>
                  <MenuButton label="Stacks" faicon="fa-cubes" onClick={() => {
                    navigation.push({
                      pathname: `/vehicle/${vehicle?.thingId}/stacks`,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <MenuButton label="Nodes" faicon="fa-cube" onClick={() => {
                    navigation.push({
                      pathname: `/vehicle/${vehicle?.thingId}/nodes`,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <MenuButton label="Topics" faicon="fa-envelope" onClick={() => {
                    navigation.push({
                      pathname: `/vehicle/${vehicle?.thingId}/topics`,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <MenuButton label="Parameters" faicon="fa-wrench" onClick={() => {
                    navigation.push({
                      pathname: `/vehicle/${vehicle?.thingId}/params`,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
                <OverflowMenuItem>
                  <MenuButton label="Reset Telemetry" faicon="fa-eye-slash" onClick={() => {
                    navigation.push({
                      pathname: `/vehicle/${vehicle?.thingId}/echo`,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
              </OverflowMenuGroup>
            </OverflowMenuContent>
          </OverflowMenu>
        </CardBody>
        <br />
      </Card>
    </div>
  )
}

export default VehicleDetail

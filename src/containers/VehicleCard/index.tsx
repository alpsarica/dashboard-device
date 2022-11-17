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
import { useHistory } from 'react-router-dom'

import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTerm,
  OverflowMenu,
  OverflowMenuContent,
  OverflowMenuItem,
  Label,
  OverflowMenuGroup
} from '@patternfly/react-core'

const MenuButton = ({ onClick, faicon, label }) => (<Label color="blue" onClick={onClick} icon={<i className={`fas ${faicon}`}></i>}>{label}</Label>)

const VehicleCard = ({ vehicle, client = undefined, connectionStatus = undefined }) => {
  const navigation = useHistory()
  const [descriptionList, setDescriptionList] = useState<any[]>([])

  useEffect(() => {
    const dl:any[] = []
    dl.push({ label: 'Policy ID:', value: vehicle?.policyId })
    dl.push({ label: 'Definition:', value: vehicle?.definition })
    Object.entries(vehicle?.attributes).map(([key, value], i) => { dl.push({ label: `Attribute:${key}`, value }) })
    dl.push({ label: 'Stack:', value: vehicle?.features?.stack?.properties?.current?.stackId || 'None' })
    dl.push({ label: 'State:', value: vehicle?.features?.stack?.properties?.current?.state || 'Unknown' })
    setDescriptionList(dl)
  }, [vehicle])

  const vehicleimg = vehicle?.attributes.brand === 'jetracer'
    ? 'https://www.waveshare.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/j/e/jetracer-pro-2gb-ai-kit-1.jpg'
    : 'https://f1tenth.readthedocs.io/en/stable/_images/f1tenth_NX.png'

  const menuItems = [
    { label: 'Stacks', icon: 'fa-cubes', url: `/vehicle/${vehicle?.thingId}/stacks` },
    { label: 'Nodes', icon: 'fa-cube', url: `/vehicle/${vehicle?.thingId}/nodes` },
    { label: 'Topics', icon: 'fa-envelope', url: `/vehicle/${vehicle?.thingId}/topics` },
    { label: 'Parameters', icon: 'fa-wrench', url: `/vehicle/${vehicle?.thingId}/params` },
    { label: 'Telemetry', icon: 'fa-podcast', url: `/vehicle/${vehicle?.thingId}/telemetry` }
  ]
  return (
    <div>
      <Card
        style={{
          textAlign: 'center'
        }}
        component="div"
      >
        <CardTitle
          style={{
            textAlign: 'start',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {vehicle?.thingId} { connectionStatus && <Label color="green" icon={<i className="pf-icon-connected"></i>} >connected to sandbox</Label>}

        </CardTitle>
      </Card>
      <Card
        style={{
          textAlign: 'center',
          margin: 20
        }}
        component="div"
      >
        <CardTitle
          style={{
            textAlign: 'start',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            fontWeight: 500,
            fontSize: 20
          }}
        >
          {vehicle?.attributes?.serial}
        </CardTitle>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <img
              style={{
                aspectRatio: 1,
                width: 200,
                height: 200,
                resize: 'both'
              }}
              src={vehicleimg}
              alt="Logo"
            />
            <DescriptionList isHorizontal isCompact style={{ marginLeft: '40px' }}>
              {descriptionList.map((o, i) => {
                return <DescriptionListGroup>
                  <DescriptionListTerm>{o.label}</DescriptionListTerm>
                  <DescriptionListDescription key={i}>
                    {o.value}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              })}
            </DescriptionList>
          </div>
        </CardBody>
        <CardFooter>
        <OverflowMenu breakpoint="md" >
            <OverflowMenuContent isPersistent>
              <OverflowMenuGroup groupType="button">
                {menuItems.map((o, i) => {
                  return <OverflowMenuItem>
                  <MenuButton label={o.label} faicon={o.icon} onClick={() => {
                    navigation.push({
                      pathname: o.url,
                      state: { vehicle }
                    })
                  }} />
                </OverflowMenuItem>
                })}
              </OverflowMenuGroup>
            </OverflowMenuContent>
          </OverflowMenu>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VehicleCard

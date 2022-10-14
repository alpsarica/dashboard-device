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
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Divider,
  PageSection,
  PageSectionVariants,
  AlertGroup,
  Grid,
  GridItem,
  Gallery,
  SearchInput,
  Label,
  Card,
  CardBody,
  CardTitle,
  CardFooter,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell
} from '@patternfly/react-core'

import CustomHeader from '../../components/CustomHeader'
import { useLazyQuery } from '@apollo/client'
import { GETVEHICLES } from '../../api/query/vehicle'

export const VehicleState = ({ state }) => {
  let color = 'grey'
  let icon = 'fas fa-info-circle'
  switch (state) {
    case 'active':
    case 'start':
    case 'running':
      color = 'green'
      icon = 'pf-icon-running'
      break
    case 'killed':
    case 'stopped':
    case 'inactive':
      color = 'red'
      icon = 'fas fa-pause-circle'
      break
    case 'failed':
      color = 'yellow'
      break
  }

  return (
    <Label color={color} icon={<i className={`${icon}`}></i>}>
      {state || 'unknown'}
    </Label>
  )
}

export const VehicleCard = ({ vehicle }) => {
  const history = useHistory()

  return (
    <Card
      isSelectableRaised
      onClick={() => {
        history.push({
          pathname: `/vehicle/${vehicle?.thingId}`,
          state: { vehicle }
        })
      }}
      style={{
        textAlign: 'left',
        margin: '10px'
      }}
      component="div"
    >
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
        {vehicle?.thingId.split(':')[1]}
      </CardTitle>
      <CardBody>
        <DataList aria-label="Compact data list example" isCompact>
          <DataListItem aria-labelledby="compact-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <span id="compact-item1">Namespace</span>
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    {vehicle?.thingId.split(':')[0]}
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="compact-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <span id="compact-item1">Serial</span>
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    {vehicle?.attributes?.serial}
                  </DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </DataList>
      </CardBody>
      <CardFooter
        style={{
          textAlign: 'center',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          fontWeight: 500,
          background: '#eee',
          color: 'white'
        }}
      >
        <VehicleState
          state={vehicle?.features?.stack?.properties?.current?.state}
        />
      </CardFooter>
    </Card>
  )
}

const Vehicle = () => {
  const [alerts] = useState([])
  const [filterValue, setFilterValue] = useState('')

  const [models, setModels] = useState([])

  const filter =
    'eq(definition,"ai.composiv.sandbox.f1tenth.simulator:TestCar:1.0.0")'
  const [getModels, { data: modelsList }] = useLazyQuery(GETVEHICLES, {
    variables: {
      filter
    },
    fetchPolicy: 'no-cache'
  })

  useEffect(() => {
    getModels().then((rdata) => {
      if (rdata) {
        console.log(rdata?.data?.vehicle?.items?.slice(0).reverse())
        setModels(rdata?.data?.vehicle?.items?.slice(0).reverse())
      }
    })
  }, [])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
    const list = modelsList?.vehicle?.items?.slice(0)
    const filtered = list.filter((i) => i.thingId.indexOf(value) >= 0)
    setModels(filtered)
  }
  const galleryStyle:any = { '--pf-l-gallery--GridTemplateColumns--min': '260px' }
  return (
    <>
      <CustomHeader
        title="Vehicle Panel"
        description="This page lists all the vehicles available and their detailed info."
        banner={<AlertGroup isLiveRegion>{alerts}</AlertGroup>} extras />
      <Divider component="div" />
      <PageSection
        variant={PageSectionVariants.light}
        padding={{ default: 'noPadding' }}
      ></PageSection>
      <Divider component="div" />

      <PageSection
        variant={PageSectionVariants.light}
        padding={{ default: 'noPadding' }}
      >
        <SearchInput
          placeholder="Name includes"
          value={filterValue}
          onChange={onFilterChange}
          onClear={(evt) => onFilterChange('', evt)}
        />
        <Grid hasGutter>
          <GridItem>
            <Gallery
              hasGutter
              style={ galleryStyle }>
              {!!models &&
                models?.map((v, i) => {
                  return <VehicleCard key={i} vehicle={v}></VehicleCard>
                })}
            </Gallery>
          </GridItem>
          ;
        </Grid>
        ;
      </PageSection>
    </>
  )
}

export default Vehicle

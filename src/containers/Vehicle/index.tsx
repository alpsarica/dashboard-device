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
import { useQuery } from '@tanstack/react-query'
import { useMqttState } from 'mqtt-react-hooks'

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
  DataListCell,
  Spinner
} from '@patternfly/react-core'

import CustomHeader from '../../components/CustomHeader'
import { VFILTER, things } from '../../api/query/vehicle'
import { ping } from '../../common/mqtt'

export const VehicleState = ({ vehicle }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = useState<any>('unknown')
  const { client } = useMqttState()

  const icon = 'fas fa-info-circle'

  useEffect(() => {
    ping(client, vehicle.thingId, () => { setState('online') })
  }, [client, vehicle])

  return (
    <Label color={state === 'online' ? 'green' : 'orange'} icon={<i className={`${state === 'online' ? 'pf-icon-running' : icon}`}></i>}>
      { state }
    </Label>
  )
}

export const VehicleCard = ({ vehicle, mqtt }) => {
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
                  <DataListCell key="secondary content">
                    {vehicle?.attributes?.brand} {vehicle?.attributes?.model}
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
          color: 'white',
          padding: '15px'
        }}
      >
        <VehicleState vehicle={vehicle} />
      </CardFooter>
    </Card>
  )
}

const Vehicle = () => {
  const [alerts] = useState([])
  const [filterValue, setFilterValue] = useState('')
  const { data, isFetching } = useQuery(['vehicle_list', VFILTER], () => things(VFILTER), { staleTime: 0, cacheTime: 1000 })

  const [models, setModels] = useState([])

  useEffect(() => {
    if (data) {
      setModels(data?.data?.items?.slice(0).reverse())
    }
  }, [data])

  const onFilterChange = (value, _event) => {
    setFilterValue(value)
    const list = data?.data?.items?.slice(0)
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
              { isFetching ? <Spinner isSVG size="xl" aria-label="Adding telemetry" /> : null }
              {!!models &&
                models?.map((v, _i) => {
                  const veh:any = v
                  return <VehicleCard key={veh.thingId} vehicle={veh} ></VehicleCard>
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

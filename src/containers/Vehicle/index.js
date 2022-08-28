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
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Divider,
  PageSection,
  PageSectionVariants,
  AlertGroup,
  Alert,
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
} from '@patternfly/react-core';

import CustomHeader from '../../components/CustomHeader';
import { useLazyQuery } from '@apollo/client';
import { GETVEHICLES } from '../../api/query/vehicle';
import { useHistory } from "react-router-dom";


export const VehicleState = ({ state }) => {
  let color = 'gray', icon = 'fas fa-info-circle'
  switch(state){
    case 'active':
    case 'start':
    case 'running':
          color = 'green';
          icon = 'pf-icon-running'
          break;
    case 'killed':
    case 'stopped':
    case 'inactive':
      color = 'red'
      icon = 'fas fa-pause-circle'
      break;
    case 'failed':
      color = 'yellow'
      break;
  }

  return ( <Label color={color} icon={<i className={`${icon}`}></i>} >{state || 'unknown'}</Label>)
}

export const VehicleCard = ({ vehicle }) => {
  const history = useHistory();

  return (
    <Card isSelectableRaised onClick={() =>{ 
      history.push({ pathname: "/vehicledetail", state: { vehicle: vehicle } })}
    } style={{
      textAlign: 'left',
      margin: "10px",
    }} component="div">
      <CardTitle style={{
        textAlign: 'center',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontWeight: 500,
        background: 'black',
        color: 'white'
      }}>
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
                  <DataListCell key="secondary content">{vehicle?.thingId.split(':')[0]}</DataListCell>
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
                  <DataListCell key="secondary content">{vehicle?.attributes?.serial}</DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </DataList>
      </CardBody>
      <CardFooter style={{
        textAlign: 'center',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontWeight: 500,
        background: '#eee',
        color: 'white'
      }}>
        <VehicleState state={vehicle?.features?.stack?.properties?.current?.state } />
        
      </CardFooter>
    </Card>
  )
}


const Vehicle = () => {

  const location = useLocation();
  const [alerts, setAlerts] = React.useState([]);
  const [filterValue, setFilterValue] = React.useState('');

  const [models, setModels] = useState()
  const showAlert = (title) => {
    const timeout = 5000;
    setAlerts(prevAlerts => {
      return [...prevAlerts,
      <Alert title={title} timeout={timeout} >
        This alert will dismiss in {`${timeout / 1000} seconds`}
      </Alert>
      ]
    });
  }

  const filter = 'eq(definition,"ai.composiv.sandbox.f1tenth.simulator:TestCar:1.0.0")';
  const [getModels, { data: modelsList }] = useLazyQuery(GETVEHICLES, {
    variables: {
      filter
    },
  });

  React.useEffect(() => {

    getModels().then(() => {
      if (modelsList) {
        console.log(modelsList?.vehicle?.items?.slice(0).reverse())
        setModels(modelsList?.vehicle?.items?.slice(0).reverse())
      }
    })
  }, [location, modelsList, getModels])

  const onFilterChange = (value, event) => {
    setFilterValue(value);
    const list = modelsList?.vehicle?.items?.slice(0);
    const filtered = list.filter( i => i.thingId.indexOf(value) >= 0)
    setModels(filtered)

  };


  return (
    <>
      <CustomHeader title="Vehicle Panel" description="This page lists all the vehicles available and their detailed info."
        banner={
          <AlertGroup isLiveRegion>
            {alerts}
          </AlertGroup>
        }
      />
      <Divider component="div" />
      <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}></PageSection>
      <Divider component="div" />

      <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
        <SearchInput
          placeholder="Name includes"
          value={filterValue}
          onChange={onFilterChange}
          onClear={evt => onFilterChange('',evt)}
        />
        <Grid hasGutter>
          <GridItem>
            <Gallery hasGutter style={{
              '--pf-l-gallery--GridTemplateColumns--min': '260px'
            }}>
              {!!models && models?.map((v, i) => {
                return (
                  <VehicleCard key={i} vehicle={v}></VehicleCard>
                )
              })}
            </Gallery>
          </GridItem>;
        </Grid>;
      </PageSection>

    </>);
}

export default Vehicle;
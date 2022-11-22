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
  CardBody,
  CardTitle,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Spinner
} from '@patternfly/react-core'

import { useHistory } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { VFILTER, things } from '../../api/query/vehicle'

const VehicleSummary = () => {
  const navigation = useHistory()
  const [summary, setSummary] = useState({ types: ['org.eclipse.muto:EdgeDevice:0.0.1'], size: '-' })
  const { data, status } = useQuery(['summary', VFILTER], () => things(VFILTER))

  useEffect(() => {
    console.log(data)
    if (data?.data) {
      const { types } = summary
      setSummary({ types, size: data?.data?.items?.length })
    }
  }, [data])

  return (
        <Card
          isSelectableRaised
          onClick={() => {
            navigation.push({
              pathname: '/vehicle'
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
            Vehicles { status === 'loading' ? <Spinner isSVG size="lg" aria-label="Adding telemetry" /> : null }
          </CardTitle>
          <CardBody>
            <DataList aria-label="Compact data list example" isCompact>
              <DataListItem aria-labelledby="compact-item1">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="compact-item1"># of Types</span>
                      </DataListCell>,
                      <DataListCell key="secondary content">
                        {summary.types.length}
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
                        <span id="compact-item1"># of Vehicles</span>
                      </DataListCell>,
                      <DataListCell key="secondary content">
                        {summary.size}
                      </DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>

        </Card>
  )
}

export default VehicleSummary

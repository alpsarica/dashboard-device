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
import React, { useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom';

import {
    Card,
    CardTitle,
    CardBody,
    CardFooter,
    Text,
    DescriptionList,
    DescriptionListGroup,
    DescriptionListDescription,
    DescriptionListTerm,
    Button
} from '@patternfly/react-core';
import { useHistory } from "react-router-dom";

const SANDBOX_URL = "ws://sandbox.composiv.ai:9001"


const VehicleDetail = () => {
    const history = useHistory();
    const location = useLocation();
    const vehicle = location.state.vehicle;

    return (
        <div>
            <Card style={{
                textAlign: 'center'
            }} component="div">
                <CardTitle style={{
                    textAlign: 'start',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}>
                    Vehicle Detail
                </CardTitle>
            </Card>
            <Card style={{
                textAlign: 'center',
                margin: 20
            }} component="div">
                <CardTitle style={{
                    textAlign: 'start',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    fontWeight: 500,
                    fontSize: 20
                }}>
                    {vehicle?.attributes?.serial}
                </CardTitle>
                <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <img style={{ aspectRatio: 1, width: 200, height: 200, resize: 'both' }} src={"https://5.imimg.com/data5/MN/ES/ZU/SELLER-19322498/bluetooth-controlled-robotic-car-kit-1000x1000.jpg"} alt="Logo" />
                        <DescriptionList
                            style={{ marginLeft: "auto" }}
                            columnModifier={{
                                default: '2Col'
                            }}
                        >
                            <DescriptionListGroup>
                                <DescriptionListTerm>Context</DescriptionListTerm>
                                <DescriptionListDescription><Text>
                                    {vehicle?.features?.context?.properties?.name}
                                </Text></DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Stack ID</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {vehicle?.thingId}
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Thing ID</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {vehicle?.features?.stack?.properties?.current?.stackId}
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Policy ID</DescriptionListTerm>
                                <DescriptionListDescription>{vehicle?.policyId}</DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Definition</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {vehicle?.definition}
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                            {vehicle?.features?.stack?.properties?.current?.state && <DescriptionListGroup>
                                <DescriptionListTerm>Status</DescriptionListTerm>
                                <DescriptionListDescription>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Text>
                                            {vehicle?.features?.stack?.properties?.current?.stackId}&nbsp;:&nbsp;
                                        </Text>
                                        <Text style={vehicle?.features?.stack?.properties?.current?.state == 'active' ? { color: 'green' } : { color: 'red' }}>
                                            {vehicle?.features?.stack?.properties?.current?.state}
                                        </Text>
                                    </div>
                                </DescriptionListDescription>
                            </DescriptionListGroup>}
                            <DescriptionListGroup>
                                <DescriptionListTerm>
                                    <Button variant='tertiary' onClick={() => history.push({pathname: "/vstack", state: { thing: vehicle }  })}>
                                        Stack Management
                                    </Button>  
                                </DescriptionListTerm>
                            </DescriptionListGroup>
                        </DescriptionList>
                    </div>
                </CardBody>
                <CardFooter>

                </CardFooter>
            </Card>
        </div>
    )
}

export default VehicleDetail
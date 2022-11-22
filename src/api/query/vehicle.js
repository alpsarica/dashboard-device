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
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

export const VFILTER = 'or(eq(definition,"ai.composiv.sandbox.f1tenth.simulator:TestCar:1.0.0"),eq(definition,"org.eclipse.muto:EdgeDevice:0.0.1"))'
export const SFILTER = 'or(eq(definition,"ai.composiv.sandbox.f1tenth:Stack:1.0.0"),eq(definition,"org.eclipse.muto:Stack:0.0.1"))'

export function things (filter) {
  return axios.get(`/api/2/search/things?filter=${filter}`)
}

export function GetDevice ({ thingid }) {
  return useQuery({
    queryKey: ['vehicle_detail', thingid],
    queryFn: () => things(`eq(thingId,"${thingid}")`),
    staleTime: 0,
    cacheTime: 1000,
    enabled: false
  })
}

export function GetStacksWitdIdLike ({ nameLike }) {
  return useQuery({
    queryKey: ['stacklist_like', nameLike],
    queryFn: () => things(`and(${SFILTER}, like(thingId,"*${nameLike}*"))`),
    staleTime: 0,
    cacheTime: 1000
  })
}

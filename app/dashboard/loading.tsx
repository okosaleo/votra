import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className='p-4 flex gap-4 w-full flex-col'>
        <div className='flex flex-col gap-2'>
            <Skeleton className='h-[40px] w-1/6' /> 
            <Skeleton className='h-[40px] w-1/4' /> 
        </div>
        <div className='flex md:flex-row flex-col gap-3'>
        <Skeleton className='h-[30vh] md:w-1/3 w-full' />
        <Skeleton className='h-[30vh] md:w-1/3 w-full' />
        <Skeleton className='h-[30vh] md:w-1/3 w-full' />
        </div>
    </div>
  )
}

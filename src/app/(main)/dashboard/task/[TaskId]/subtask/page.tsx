import React, { use } from 'react'

const Page = ({ params }: {
    params: Promise<{ TaskId: string }>
}) => {
    const { TaskId } = use(params)

  return (
    <div>{TaskId}</div>
  )
}

export default Page


// app/task/[taskId]/page.tsx

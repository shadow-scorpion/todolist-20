import { TaskStatus } from "@/common/enums"
import { useGetTasksQuery, useReorderTaskMutation } from "@/features/todolists/api/tasksApi"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import List from "@mui/material/List"
import { TaskItem } from "./TaskItem/TaskItem"
import { TasksSkeleton } from "./TasksSkeleton/TasksSkeleton"
import { useState } from "react"
import { TasksPagination } from "@/features/todolists/ui/Todolists/TodolistItem/Tasks/TasksPagination/TasksPagination.tsx"
import { PAGE_SIZE } from "@/common/constants"
import { DragDropProvider } from "@dnd-kit/react"
import { calculateReorderPayload } from "@/common/utils"

type Props = {
  todolist: DomainTodolist
}

export const Tasks = ({ todolist }: Props) => {
  const [page, setPage] = useState(1)
  const { id, filter } = todolist

  const { data, isLoading } = useGetTasksQuery({ todolistId: id, params: { page } })
  const [reorderTask] = useReorderTaskMutation()

  let filteredTasks = data?.items
  if (filter === "active") {
    filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.New)
  }
  if (filter === "completed") {
    filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.Completed)
  }

  if (isLoading) {
    return <TasksSkeleton />
  }

  return (
    <>
      {filteredTasks?.length === 0 ? (
        <p>Тасок нет</p>
      ) : (
        <>
          <DragDropProvider
            onDragEnd={(event) => {
              if(!data?.items) return
              if (event.canceled || !event.operation.target) return
              // console.log(event)
              // console.log(event.operation.source.initialIndex)
              // console.log(event.operation.source?.index)
              const payload = calculateReorderPayload(data?.items, event)
              if(!payload) return
              reorderTask({ todolistId: id, taskId: payload.dragItemId, payload})
            }}
          >
            <List>
              {filteredTasks?.map((task, index) => (
                <TaskItem key={task.id} index={index} task={task} todolist={todolist} />
              ))}
            </List>
          </DragDropProvider>
          {(data?.totalCount ?? 0) > PAGE_SIZE && (
            <TasksPagination page={page} setPage={setPage} totalCount={data?.totalCount || 0} />
          )}
        </>
      )}
    </>
  )
}

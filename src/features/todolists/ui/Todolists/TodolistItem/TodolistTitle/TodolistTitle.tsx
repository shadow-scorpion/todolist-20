import { EditableSpan } from "@/common/components"
import { useAppDispatch } from "@/common/hooks"
import type { RequestStatus } from "@/common/types"
import {
  todolistsApi,
  useRemoveTodolistMutation,
  useUpdateTodolistTitleMutation,
} from "@/features/todolists/api/todolistsApi"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import DeleteIcon from "@mui/icons-material/Delete"
import IconButton from "@mui/material/IconButton"
import styles from "./TodolistTitle.module.css"

type Props = {
  todolist: DomainTodolist
}

export const TodolistTitle = ({ todolist }: Props) => {
  const { id, title, entityStatus } = todolist

  const [removeTodolist] = useRemoveTodolistMutation()
  const [updateTodolistTitle] = useUpdateTodolistTitleMutation()

  const dispatch = useAppDispatch()

  const deleteTodolist = async () => {
    const patchResult = dispatch(
      todolistsApi.util.updateQueryData("getTodolists", undefined, (state) => {
          const index = state.findIndex(todo => todo.id === id)
        console.log(index)
          if (index !== -1) state.splice(index, 1)
        })
    );

    try {
      await removeTodolist('id').unwrap()
    } catch (e) {
      patchResult.undo()
    }
  }

  const changeTodolistTitle = (title: string) => {
    updateTodolistTitle({ id, title })
  }

  return (
    <div className={styles.container}>
      <h3>
        <EditableSpan value={title} onChange={changeTodolistTitle} />
      </h3>
      <IconButton onClick={deleteTodolist} disabled={entityStatus === "loading"}>
        <DeleteIcon />
      </IconButton>
    </div>
  )
}

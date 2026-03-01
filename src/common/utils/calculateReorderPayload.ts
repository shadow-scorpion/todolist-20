import { DragEndEvent } from "@dnd-kit/dom"
import { move } from "@dnd-kit/helpers"
import { DomainTodolist } from "@/features/todolists/lib/types"
import { DomainTask } from "@/features/todolists/api/tasksApi.types.ts"

type DragEventObject = Parameters<DragEndEvent>[0]

export const calculateReorderPayload = <T extends DomainTodolist | DomainTask>(items: T[], event: DragEventObject) => {
  const {source, target, canceled} = event.operation
  if (canceled || !target) {
    console.log('Its null')
    return null
  }
  const arrId = items.map((item)=> item.id)
  const newSortOrder = move(arrId, event)
  // console.log(arrId)
  // console.log(newSortOrder)
  const dragItemId = source?.id
  const newIndex = newSortOrder.findIndex((id)=> id === dragItemId)
  const oldIndex = items.findIndex((item) => item.id === dragItemId)
  if (oldIndex === newIndex) {
    return null;
  }

  let putAfterItemId = null
  if(newIndex > 0) {
    putAfterItemId = newSortOrder[newIndex-1]
  }
  return {dragItemId, oldIndex, newIndex, putAfterItemId}
}
import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import { PAGE_SIZE } from "@/common/constants"

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, { todolistId: string; params: { page: number } }>({
      query: ({ todolistId, params }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        params: {...params, count: PAGE_SIZE}
      }),
      providesTags: (_result, _error, arg) => {
        return [{ type: "Task", id: arg.todolistId }]
      },
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      onQueryStarted: async ({ todolistId, taskId }, mutationLifeCycleApi) => {
        const cachedArg = tasksApi.util.selectCachedArgsForQuery(mutationLifeCycleApi.getState(), "getTasks")
        const patchResult: any[] = []

        cachedArg.forEach((arg) =>
          patchResult.push(
            mutationLifeCycleApi.dispatch(
              tasksApi.util.updateQueryData("getTasks", { todolistId, params: { page: arg.params.page } }, (state) => {
                const findIndexTask = state.items.findIndex((task) => task.id === taskId)
                if (findIndexTask !== -1) state.items.splice(findIndexTask, 1)
              }),
            ),
          ),
        )
        try {
          await mutationLifeCycleApi.queryFulfilled
        } catch (e) {
          patchResult.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel }
    >({
      query: ({ todolistId, taskId, model }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "PUT",
        body: model,
      }),
      onQueryStarted: async ({ todolistId, taskId, model }, { dispatch, queryFulfilled, getState }) => {
        const cachedArgs = tasksApi.util.selectCachedArgsForQuery(getState(), "getTasks")
        const patchResult: any[] = []

        cachedArgs.forEach((arg) =>
          patchResult.push(
            dispatch(
              tasksApi.util.updateQueryData(
                "getTasks",
                { todolistId: todolistId, params: { page: arg.params.page } },
                (state) => {
                  const index = state.items.findIndex((task) => task.id === taskId)
                  if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...model }
                  }
                },
              ),
            ),
          ),
        )
        try {
          await queryFulfilled
        } catch (e) {
          patchResult.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
    reorderTask: build.mutation<
      BaseResponse,
      {
        todolistId: string
        taskId: string | undefined
        payload: { oldIndex: number; newIndex: number; putAfterItemId: string | null }
      }
    >({
      query: ({ todolistId, taskId, payload: { putAfterItemId } }) => ({
        url: `/todo-lists/${todolistId}/tasks/${taskId}/reorder`,
        method: "PUT",
        body: { putAfterItemId },
      }),
      onQueryStarted: async ({ todolistId, taskId, payload }, mutationLifeCycleApi) => {
        const cachedArgs = tasksApi.util.selectCachedArgsForQuery(mutationLifeCycleApi.getState(), "getTasks")
        let patchResult: any[] = []

        cachedArgs.forEach((arg) => {
          patchResult.push(
            mutationLifeCycleApi.dispatch(
              tasksApi.util.updateQueryData("getTasks", { todolistId, params: { page: arg.params.page } }, (state) => {
                // Что бы не вычислять тут старый и новый index, что не очень надёжно, лучше получить их в аргументах, так точно не будет разбежностей.
                const { oldIndex, newIndex } = payload
                if (state.items[oldIndex]?.id === taskId) {
                  const [dragTask] = state.items.splice(oldIndex, 1)
                  state.items.splice(newIndex, 0, dragTask)
                }

              }),
            ),
          )
        })
        try {
          await mutationLifeCycleApi.queryFulfilled
        } catch (e) {
          patchResult.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useRemoveTaskMutation,
  useUpdateTaskMutation,
  useReorderTaskMutation,
} = tasksApi

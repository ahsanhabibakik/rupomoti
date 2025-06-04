import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface UIState {
  sidebarOpen: boolean
  cartDrawerOpen: boolean
  loading: {
    [key: string]: boolean
  }
  notifications: {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }[]
}

const initialState: UIState = {
  sidebarOpen: false,
  cartDrawerOpen: false,
  loading: {},
  notifications: []
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen
    },
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.cartDrawerOpen = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning'
        message: string
      }>
    ) => {
      state.notifications.push({
        id: Date.now().toString(),
        ...action.payload
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    }
  }
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCartDrawer,
  setCartDrawerOpen,
  setLoading,
  addNotification,
  removeNotification
} = uiSlice.actions

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen
export const selectCartDrawerOpen = (state: RootState) => state.ui.cartDrawerOpen
export const selectLoading = (key: string) => (state: RootState) => state.ui.loading[key]
export const selectNotifications = (state: RootState) => state.ui.notifications

export default uiSlice.reducer 
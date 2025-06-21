import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

interface UIState {
  isCartDrawerOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
}

const initialState: UIState = {
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartDrawerOpen = action.payload
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload
    },
  },
})

export const { setCartDrawerOpen, setMobileMenuOpen, setSearchOpen } =
  uiSlice.actions

// Selectors
export const selectIsCartDrawerOpen = (state: RootState) =>
  state.ui.isCartDrawerOpen
export const selectIsMobileMenuOpen = (state: RootState) =>
  state.ui.isMobileMenuOpen
export const selectIsSearchOpen = (state: RootState) => state.ui.isSearchOpen

export default uiSlice.reducer 
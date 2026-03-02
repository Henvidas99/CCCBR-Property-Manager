const isFilterSidebarOpen = ref(false)

export const useFilterSidebar = () => {
  const openFilterSidebar = () => { isFilterSidebarOpen.value = true }
  const closeFilterSidebar = () => { isFilterSidebarOpen.value = false }
  const toggleFilterSidebar = () => { isFilterSidebarOpen.value = !isFilterSidebarOpen.value }

  return { isFilterSidebarOpen: readonly(isFilterSidebarOpen), openFilterSidebar, closeFilterSidebar, toggleFilterSidebar }
}

export const useLocation = () => {
  const selectedProvince = useState<string>('selectedProvince', () => '')
  const selectedCantons = useState<string[]>('selectedCantons', () => [])
  const selectedDistricts = useState<string[]>('selectedDistricts', () => [])

  const setLocation = (province: string, cantons?: string[], districts?: string[]) => {
    selectedProvince.value = province
    selectedCantons.value = cantons || []
    selectedDistricts.value = districts || []
  }

  const clearLocation = () => {
    selectedProvince.value = ''
    selectedCantons.value = []
    selectedDistricts.value = []
  }

  const toggleCanton = (canton: string) => {
    const index = selectedCantons.value.indexOf(canton)
    if (index === -1) {
      selectedCantons.value = [...selectedCantons.value, canton]
    } else {
      selectedCantons.value = selectedCantons.value.filter(c => c !== canton)
    }
  }

  const getLocationLabel = () => {
    if (selectedDistricts.value.length > 0 && selectedProvince.value) {
      if (selectedDistricts.value.length === 1) {
        return `${selectedDistricts.value[0]}, ${selectedProvince.value}`
      }
      return `${selectedDistricts.value.length} distritos, ${selectedProvince.value}`
    }
    if (selectedCantons.value.length > 1 && selectedProvince.value) {
      return `${selectedCantons.value.length} cantones, ${selectedProvince.value}`
    }
    if (selectedCantons.value.length === 1 && selectedProvince.value) {
      return `${selectedCantons.value[0]}, ${selectedProvince.value}`
    }
    if (selectedProvince.value) {
      return selectedProvince.value
    }
    return 'Ubicacion'
  }

  return {
    selectedProvince: readonly(selectedProvince),
    selectedCantons: readonly(selectedCantons),
    selectedDistricts: readonly(selectedDistricts),
    setLocation,
    clearLocation,
    toggleCanton,
    getLocationLabel,
  }
}

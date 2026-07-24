import Swal from 'sweetalert2'

export function useSweetAlert() {
  const showSuccess = (title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#1e40af',
    })
  }

  const showError = (title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#dc2626',
    })
  }

  const showConfirm = (title, text, confirmText = 'Confirmer') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: 'Annuler',
    })
  }

  const showPrompt = (title, inputLabel, placeholder) => {
    return Swal.fire({
      title,
      input: 'textarea',
      inputLabel,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Ce champ est obligatoire'
      },
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#6b7280',
    })
  }

  return { showSuccess, showError, showConfirm, showPrompt }
}
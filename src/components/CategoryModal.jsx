import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalForm = styled.form`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &.error {
    border-color: #dc3545;
  }

  &.error:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &.error {
    border-color: #dc3545;
  }

  &.error:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
`;

const CharacterCount = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.25rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;

  &::before {
    content: '⚠';
    margin-right: 0.25rem;
  }
`;

const GeneralError = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #721c24;
  font-size: 0.8rem;

  &::before {
    content: '❌';
    margin-right: 0.25rem;
  }
`;



const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 120px;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: var(--text-light);
  color: var(--text-inverse);

  &:hover:not(:disabled) {
    background-color: var(--text-muted);
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: var(--primary);
  color: var(--text-inverse);

  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: var(--text-light);
  }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Helper function to determine if a color is light
const isLightColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
};

const CategoryModal = ({ isOpen, onClose, onCategoryCreated, existingCategories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Apply styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    } else {
      // Check for duplicate names (case-insensitive)
      const isDuplicate = existingCategories.some(
        cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.name = 'A category with this name already exists';
      }
    }

    // Validate description (optional but if provided, should be reasonable length)
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || ''
      };

      // Call the parent's callback to handle the API call
      await onCategoryCreated(categoryData);
      
      // Reset form and close modal on success
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already exists')) {
        setErrors({ name: 'A category with this name already exists' });
      } else if (error.message && error.message.includes('authentication')) {
        setErrors({ general: 'Authentication required. Please log in again.' });
      } else {
        setErrors({ general: 'Failed to create category. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create New Category</ModalTitle>
          <CloseButton 
            type="button" 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            ×
          </CloseButton>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          {errors.general && (
            <GeneralError>
              {errors.general}
            </GeneralError>
          )}

          <FormGroup>
            <Label htmlFor="categoryName">
              Category Name *
            </Label>
            <Input
              type="text"
              id="categoryName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter category name (e.g., Technology, Travel)"
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.name && (
              <ErrorMessage>{errors.name}</ErrorMessage>
            )}
            <CharacterCount>
              {formData.name.length}/50 characters
            </CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categoryDescription">
              Description (Optional)
            </Label>
            <TextArea
              id="categoryDescription"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Brief description of this category (optional)"
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.description && (
              <ErrorMessage>{errors.description}</ErrorMessage>
            )}
            <CharacterCount>
              {formData.description.length}/200 characters
            </CharacterCount>
          </FormGroup>



          <ModalActions>
            <SecondaryButton
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </PrimaryButton>
          </ModalActions>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CategoryModal;
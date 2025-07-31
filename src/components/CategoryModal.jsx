import React, { useState } from 'react';
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

const ColorSelection = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ColorOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 123, 255, 0.05);
  }

  input[type="radio"] {
    display: none;
  }
`;

const ColorSwatch = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  transition: all 0.2s ease;
  background-color: ${props => props.color};

  ${ColorOption}:hover & {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ColorCheck = styled.span`
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ColorLabel = styled.span`
  font-size: 0.7rem;
  color: #6c757d;
  text-align: center;
`;

const CustomColorSection = styled.div`
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
`;

const CustomColorLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
`;

const CustomColorInput = styled.input`
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const CategoryPreview = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
  }
`;

const CategoryTagPreview = styled.div`
  display: flex;
  align-items: center;
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: ${props => props.color};
  color: ${props => isLightColor(props.color) ? '#333' : '#fff'};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background-color: #5a6268;
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #007bff;
  color: white;

  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #6c757d;
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
    description: '',
    color: '#007bff'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined color options
  const colorOptions = [
    { value: '#007bff', label: 'Blue', name: 'Primary Blue' },
    { value: '#28a745', label: 'Green', name: 'Success Green' },
    { value: '#dc3545', label: 'Red', name: 'Danger Red' },
    { value: '#ffc107', label: 'Yellow', name: 'Warning Yellow' },
    { value: '#6f42c1', label: 'Purple', name: 'Info Purple' },
    { value: '#fd7e14', label: 'Orange', name: 'Warning Orange' },
    { value: '#20c997', label: 'Teal', name: 'Success Teal' },
    { value: '#e83e8c', label: 'Pink', name: 'Secondary Pink' },
    { value: '#6c757d', label: 'Gray', name: 'Secondary Gray' },
    { value: '#17a2b8', label: 'Cyan', name: 'Info Cyan' },
    { value: '#343a40', label: 'Dark', name: 'Dark Gray' },
    { value: '#f8f9fa', label: 'Light', name: 'Light Gray' }
  ];

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

    // Validate color
    if (!formData.color) {
      newErrors.color = 'Please select a color';
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
        description: formData.description.trim() || '',
        color: formData.color
      };

      // Call the parent's callback to handle the API call
      await onCategoryCreated(categoryData);
      
      // Reset form and close modal on success
      setFormData({ name: '', description: '', color: '#007bff' });
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
      setFormData({ name: '', description: '', color: '#007bff' });
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

          <FormGroup>
            <Label htmlFor="categoryColor">
              Category Color *
            </Label>
            <ColorSelection>
              <ColorGrid>
                {colorOptions.map((color) => (
                  <ColorOption key={color.value}>
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={formData.color === color.value}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <ColorSwatch color={color.value}>
                      {formData.color === color.value && (
                        <ColorCheck>✓</ColorCheck>
                      )}
                    </ColorSwatch>
                    <ColorLabel>{color.label}</ColorLabel>
                  </ColorOption>
                ))}
              </ColorGrid>
              
              {/* Custom color input */}
              <CustomColorSection>
                <CustomColorLabel>
                  <span>Custom Color:</span>
                  <CustomColorInput
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </CustomColorLabel>
              </CustomColorSection>
            </ColorSelection>
            {errors.color && (
              <ErrorMessage>{errors.color}</ErrorMessage>
            )}
          </FormGroup>

          <CategoryPreview>
            <h4>Preview:</h4>
            <CategoryTagPreview>
              <CategoryTag color={formData.color}>
                {formData.name || 'Category Name'}
              </CategoryTag>
            </CategoryTagPreview>
          </CategoryPreview>

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
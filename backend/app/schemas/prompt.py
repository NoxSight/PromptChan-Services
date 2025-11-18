"""Pydantic schemas for PromptTemplate model with comprehensive validation"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
from ..schemas.user import User
import re


class Visibility(str, Enum):
    """Prompt visibility enum."""
    PUBLIC = "public"
    PRIVATE = "private"


class InputField(BaseModel):
    """Single input field definition for prompt templates."""
    name: str
    type: str
    label: str
    description: Optional[str] = None
    placeholder: Optional[str] = None
    required: bool = False
    validation: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, str]]] = None


class PromptBase(BaseModel):
    """Base prompt schema with common fields."""
    title: str
    short_description: str
    long_description: Optional[str] = None
    template: str
    inputs: Optional[List[InputField]] = None
    tags: Optional[str] = None
    visibility: Visibility = Visibility.PUBLIC

    @validator('template')
    def validate_template_brackets(cls, v):
        """Validate that all {{ have matching }} brackets."""
        stack = []
        i = 0
        length = len(v)
        
        while i < length:
            if v[i:i+2] == '{{':
                stack.append('{{')
                i += 2
            elif v[i:i+2] == '}}' and stack:
                stack.pop()
                i += 2
            else:
                i += 1
        
        if stack:
            raise ValueError("Unclosed mustache brackets {{ }} found in template")
        
        return v

    @validator('template')
    def validate_placeholder_names(cls, v, values):
        """Validate that all placeholder names in template match inputs field names."""
        if 'inputs' not in values or values['inputs'] is None:
            return v
        
        input_names = {field.name for field in values['inputs']}
        placeholder_pattern = r'\{\{\s*([^\}\s]+)\s*\}\}'
        placeholders = re.findall(placeholder_pattern, v)
        
        invalid_placeholders = [ph for ph in placeholders if ph not in input_names]
        
        if invalid_placeholders:
            raise ValueError(
                f"Placeholder names {invalid_placeholders} in template do not match "
                f"any input field names. Available inputs: {list(input_names)}"
            )
        
        return v


class PromptCreate(PromptBase):
    """Schema for creating a new prompt template."""
    pass


class PromptUpdate(BaseModel):
    """Schema for updating prompt template (all fields optional)."""
    title: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    template: Optional[str] = None
    inputs: Optional[List[InputField]] = None
    tags: Optional[str] = None
    visibility: Optional[Visibility] = None

    @validator('template', pre=True, always=True)
    def validate_update_template_brackets(cls, v, values):
        """Validate template brackets on update (if template provided)."""
        if v is not None:
            return PromptBase.validate_template_brackets(cls, v)
        return v

    @validator('template', pre=True, always=True)
    def validate_update_placeholder_names(cls, v, values):
        """Validate placeholder names on update (if template provided)."""
        if v is not None and 'inputs' in values and values['inputs'] is not None:
            return PromptBase.validate_placeholder_names(cls, v, {'inputs': values['inputs']})
        return v


class Prompt(PromptBase):
    """Response schema for prompt template."""
    id: int
    creator: User
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


__all__ = ["InputField", "PromptBase", "PromptCreate", "PromptUpdate", "Prompt", "Visibility"]
/**
 * 表单验证工具库
 * 提供统一的表单验证规则和错误处理
 */

// ============================================
// 验证规则类型定义
// ============================================
export type ValidationRule<T = string> = {
  validator: (value: T) => boolean;
  message: string;
};

export type ValidationRules<T = string> = {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | string;
  phone?: boolean | string;
  url?: boolean | string;
  numeric?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  custom?: ValidationRule<T> | ValidationRule<T>[];
};

export type FieldValidationState = {
  value: string;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

export type FormValidationState<T extends Record<string, string>> = {
  [K in keyof T]: FieldValidationState;
};

// ============================================
// 内置验证规则
// ============================================

const defaultMessages = {
  required: '此字段为必填项',
  minLength: (min: number) => `至少需要 ${min} 个字符`,
  maxLength: (max: number) => `最多允许 ${max} 个字符`,
  pattern: '格式不正确',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的手机号码',
  url: '请输入有效的网址',
  numeric: '请输入数字',
  min: (min: number) => `最小值为 ${min}`,
  max: (max: number) => `最大值为 ${max}`,
};

// 邮箱正则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 手机号正则（中国大陆）
const phoneRegex = /^1[3-9]\d{9}$/;

// URL 正则
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// ============================================
// 验证函数
// ============================================

/**
 * 验证单个值
 */
export const validateField = (
  value: string,
  rules: ValidationRules
): string | null => {
  // 必填验证
  if (rules.required) {
    const isRequired = typeof rules.required === 'boolean' ? rules.required : true;
    const message = typeof rules.required === 'string' ? rules.required : defaultMessages.required;
    if (isRequired && (!value || value.trim() === '')) {
      return message;
    }
  }

  // 如果值为空且不是必填，跳过其他验证
  if (!value || value.trim() === '') {
    return null;
  }

  // 最小长度验证
  if (rules.minLength !== undefined) {
    const min = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value;
    const message = typeof rules.minLength === 'number' 
      ? defaultMessages.minLength(min) 
      : rules.minLength.message;
    if (value.length < min) {
      return message;
    }
  }

  // 最大长度验证
  if (rules.maxLength !== undefined) {
    const max = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value;
    const message = typeof rules.maxLength === 'number' 
      ? defaultMessages.maxLength(max) 
      : rules.maxLength.message;
    if (value.length > max) {
      return message;
    }
  }

  // 正则验证
  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
    const message = rules.pattern instanceof RegExp ? defaultMessages.pattern : rules.pattern.message;
    if (!pattern.test(value)) {
      return message;
    }
  }

  // 邮箱验证
  if (rules.email) {
    const message = typeof rules.email === 'string' ? rules.email : defaultMessages.email;
    if (!emailRegex.test(value)) {
      return message;
    }
  }

  // 手机号验证
  if (rules.phone) {
    const message = typeof rules.phone === 'string' ? rules.phone : defaultMessages.phone;
    if (!phoneRegex.test(value)) {
      return message;
    }
  }

  // URL 验证
  if (rules.url) {
    const message = typeof rules.url === 'string' ? rules.url : defaultMessages.url;
    if (!urlRegex.test(value)) {
      return message;
    }
  }

  // 数字验证
  if (rules.numeric) {
    const message = typeof rules.numeric === 'string' ? rules.numeric : defaultMessages.numeric;
    if (isNaN(Number(value))) {
      return message;
    }
  }

  // 最小值验证
  if (rules.min !== undefined) {
    const min = typeof rules.min === 'number' ? rules.min : rules.min.value;
    const message = typeof rules.min === 'number' 
      ? defaultMessages.min(min) 
      : rules.min.message;
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < min) {
      return message;
    }
  }

  // 最大值验证
  if (rules.max !== undefined) {
    const max = typeof rules.max === 'number' ? rules.max : rules.max.value;
    const message = typeof rules.max === 'number' 
      ? defaultMessages.max(max) 
      : rules.max.message;
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > max) {
      return message;
    }
  }

  // 自定义验证
  if (rules.custom) {
    const customRules = Array.isArray(rules.custom) ? rules.custom : [rules.custom];
    for (const rule of customRules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
  }

  return null;
};

/**
 * 验证整个表单
 */
export const validateForm = <T extends Record<string, string>>(
  values: T,
  rules: { [K in keyof T]?: ValidationRules }
): { [K in keyof T]?: string } => {
  const errors: { [K in keyof T]?: string } = {};

  for (const key in rules) {
    const value = values[key] || '';
    const fieldRules = rules[key];
    if (fieldRules) {
      const error = validateField(value, fieldRules);
      if (error) {
        errors[key] = error;
      }
    }
  }

  return errors;
};

// ============================================
// React Hook - 表单验证
// ============================================

import { useState, useCallback } from 'react';

interface UseFormValidationOptions<T extends Record<string, string>> {
  initialValues: T;
  validationRules: { [K in keyof T]?: ValidationRules };
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationReturn<T extends Record<string, string>> {
  values: T;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  dirty: { [K in keyof T]?: boolean };
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: string) => void;
  setValues: (newValues: Partial<T>) => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  clearError: (field: keyof T) => void;
}

export const useFormValidation = <T extends Record<string, string>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> => {
  const { initialValues, validationRules, validateOnChange = true, validateOnBlur = true } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [dirty, setDirty] = useState<{ [K in keyof T]?: boolean }>({});

  const validateSingleField = useCallback((field: keyof T, value: string): boolean => {
    const rules = validationRules[field];
    if (!rules) return true;

    const error = validateField(value, rules);
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [validationRules]);

  const setValue = useCallback((field: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setDirty(prev => ({ ...prev, [field]: true }));

    if (validateOnChange) {
      validateSingleField(field, value);
    }
  }, [validateOnChange, validateSingleField]);

  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    Object.keys(newValues).forEach(key => {
      setDirty(prev => ({ ...prev, [key]: true }));
    });
  }, []);

  const handleChange = useCallback((field: keyof T) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, e.target.value);
    }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validateOnBlur) {
      validateSingleField(field, values[field]);
    }
  }, [validateOnBlur, validateSingleField, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors = validateForm(values, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty({});
  }, [initialValues]);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = Object.keys(dirty).some(key => dirty[key as keyof T]);

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    setValue,
    setValues: setMultipleValues,
    handleChange,
    handleBlur,
    validateField: (field: keyof T) => validateSingleField(field, values[field]),
    validateAll,
    reset,
    clearError,
  };
};

// ============================================
// 常用验证规则预设
// ============================================

export const validationPresets = {
  // 用户名
  username: {
    required: '请输入用户名',
    minLength: { value: 3, message: '用户名至少需要 3 个字符' },
    maxLength: { value: 20, message: '用户名最多 20 个字符' },
    pattern: { 
      value: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
      message: '用户名只能包含字母、数字、下划线和中文' 
    },
  },
  // 邮箱
  email: {
    required: '请输入邮箱地址',
    email: '请输入有效的邮箱地址',
  },
  // 密码
  password: {
    required: '请输入密码',
    minLength: { value: 8, message: '密码至少需要 8 个字符' },
    pattern: { 
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      message: '密码必须包含大小写字母和数字' 
    },
  },
  // 手机号
  phone: {
    required: '请输入手机号码',
    phone: '请输入有效的手机号码',
  },
  // 验证码
  verificationCode: {
    required: '请输入验证码',
    pattern: { value: /^\d{6}$/, message: '验证码为 6 位数字' },
  },
  // 通用必填
  required: (fieldName: string) => ({
    required: `请输入${fieldName}`,
  }),
  // 通用长度限制
  length: (fieldName: string, min: number, max: number) => ({
    required: `请输入${fieldName}`,
    minLength: { value: min, message: `${fieldName}至少需要 ${min} 个字符` },
    maxLength: { value: max, message: `${fieldName}最多 ${max} 个字符` },
  }),
};

export default {
  validateField,
  validateForm,
  useFormValidation,
  validationPresets,
};

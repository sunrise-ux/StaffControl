import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/api';
import { Project } from '../../types';
import './Projects.css';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
}

// Интерфейс для данных формы
interface ProjectFormData {
  name: string;
  description: string;
  budget: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  endDate: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    budget: 0,
    priority: 'MEDIUM',
    status: 'ACTIVE',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        budget: project.budget || 0,
        priority: project.priority || 'MEDIUM',
        status: project.status || 'ACTIVE',
        startDate: project.startDate || '',
        endDate: project.endDate || ''
      });
    }
  }, [project]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (project) {
        // Для обновления - используем Partial<Project>
        const updateData: Partial<Project> = {
          name: formData.name,
          description: formData.description,
          budget: formData.budget,
          priority: formData.priority,
          status: formData.status,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
        };
        await projectService.update(project.id, updateData);
        alert('Проект обновлен');
      } else {
        // Для создания - используем Omit<Project, 'id' | 'createdAt'>
        const createData: Omit<Project, 'id' | 'createdAt'> = {
          name: formData.name,
          description: formData.description,
          budget: formData.budget,
          priority: formData.priority,
          status: formData.status,
          startDate: formData.startDate || '',
          endDate: formData.endDate || ''
        };
        await projectService.create(createData);
        alert('Проект создан');
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{project ? 'Редактирование проекта' : 'Новый проект'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название проекта *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Введите название проекта"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание проекта"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Бюджет (руб.)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="1000"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Приоритет</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="HIGH">Высокий</option>
                <option value="MEDIUM">Средний</option>
                <option value="LOW">Низкий</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Статус</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Активный</option>
                <option value="ON_HOLD">Приостановлен</option>
                <option value="COMPLETED">Завершен</option>
              </select>
            </div>

            <div className="form-group">
              <label>Дата начала</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Дата окончания</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : (project ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
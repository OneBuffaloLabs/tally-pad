'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { CourseTemplate } from '@/types';

interface CourseSelectionProps {
  courses: CourseTemplate[];
  onSelectCourse: (course: CourseTemplate) => void;
  onNewCourse: () => void;
  onDeleteCourse: (course: CourseTemplate) => void;
}

export default function CourseSelection({
  courses,
  onSelectCourse,
  onNewCourse,
  onDeleteCourse,
}: CourseSelectionProps) {
  return (
    <div>
      <h2 className='text-3xl font-bold text-foreground mb-4'>Select a Course</h2>
      <div className='grid grid-cols-1 gap-4'>
        {courses.map((course) => (
          <div
            key={course._id}
            className='flex justify-between items-center p-4 bg-foreground/5 rounded-lg border border-border'>
            <button
              onClick={() => onSelectCourse(course)}
              className='text-left flex-grow hover:text-primary transition-colors cursor-pointer'>
              <span className='font-bold text-lg'>{course.name}</span>
              <span className='text-sm text-foreground/60 ml-2'>({course.holeCount} holes)</span>
            </button>
            <button
              onClick={() => onDeleteCourse(course)}
              className='text-red-500 hover:text-red-700 cursor-pointer p-2'>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
        <button
          onClick={onNewCourse}
          className='cursor-pointer text-left p-4 bg-primary/10 rounded-lg border border-primary/20 shadow-sm hover:shadow-lg transition-all flex items-center gap-3'>
          <FontAwesomeIcon icon={faPlusCircle} className='text-primary' />
          <span className='font-bold text-lg text-primary'>New Custom Course</span>
        </button>
      </div>
    </div>
  );
}

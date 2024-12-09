import { useState } from 'react';
import { Modal, Button, Input, Textarea, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  studentId: string;
  currentGrade?: number;
  currentFeedback?: string;
  onGradeUpdate: () => void;
}

export default function GradeModal({
  isOpen,
  onClose,
  courseId,
  studentId,
  currentGrade,
  currentFeedback,
  onGradeUpdate
}: GradeModalProps) {
  const [grade, setGrade] = useState(currentGrade?.toString() || '');
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/courses/${courseId}/grades`, {
        studentId,
        grade: Number(grade),
        feedback
      });
      
      toast.success('Grade updated successfully');
      onGradeUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update grade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Grade
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade (0-100)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter feedback (optional)"
                    rows={4}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                Save Grade
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 
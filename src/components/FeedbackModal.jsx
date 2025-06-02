import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const FeedbackModal = ({ onClose }) => {
  const handleSubmit = (event) => {
    // Form submission is handled by FormSubmit.co
    // You can add a toast notification here if needed after submission,
    // but the redirect will happen via FormSubmit's _next field.
    // For now, we'll just let the form submit.
    // If you want to prevent default and use fetch, you can do that here.
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold">Submit Feedback</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form action="https://formsubmit.co/hiteshmistari017@gmail.com" method="POST" onSubmit={handleSubmit}>
              <Textarea
                name="feedback"
                placeholder="Type your feedback here..."
                required
                rows={6}
                className="w-full p-2 border-input focus:ring-primary focus:border-primary"
              />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value="https://your-app-domain.com/feedback-thank-you" />
              
              <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Feedback
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground pt-4">
            <p>Your feedback helps us improve! Please note this form submits directly to our feedback channel.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackModal;
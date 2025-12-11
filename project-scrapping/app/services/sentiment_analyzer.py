from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Optional
import logging
from app.config import settings

class SentimentAnalyzer:
    def __init__(self):
        """Initialize sentiment analysis model"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(settings.SENTIMENT_MODEL)
            self.model = AutoModelForSequenceClassification.from_pretrained(settings.SENTIMENT_MODEL)
            self.classifier = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                return_all_scores=True
            )
            logging.info(f"Sentiment analyzer initialized with model: {settings.SENTIMENT_MODEL}")
        except Exception as e:
            logging.error(f"Failed to initialize sentiment analyzer: {e}")
            self.classifier = None
    
    def analyze_text(self, text: str) -> Optional[float]:
        """
        Analyze sentiment of text
        Returns: Float between -1 (negative) and 1 (positive)
        """
        if not self.classifier or not text:
            return None
        
        try:
            # Truncate text if too long
            max_length = 512
            if len(text) > max_length:
                text = text[:max_length]
            
            # Get prediction
            results = self.classifier(text)
            
            # Convert to -1 to 1 scale
            if isinstance(results[0], list):
                scores = results[0]
                positive_score = next((s['score'] for s in scores if s['label'] == 'POSITIVE'), 0)
                negative_score = next((s['score'] for s in scores if s['label'] == 'NEGATIVE'), 0)
                return positive_score - negative_score
            else:
                # Fallback for different model outputs
                return 0.0
                
        except Exception as e:
            logging.error(f"Error analyzing sentiment: {e}")
            return None
    
    def analyze_batch(self, texts: list) -> list:
        """Analyze sentiment for multiple texts"""
        if not self.classifier:
            return [None] * len(texts)
        
        results = []
        batch_size = settings.BATCH_SIZE
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_results = []
            
            for text in batch:
                score = self.analyze_text(text)
                batch_results.append(score)
            
            results.extend(batch_results)
        
        return results
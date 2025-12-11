import re
import pandas as pd
from typing import List, Dict, Any, Optional
import html
import unicodedata

class DataCleaner:
    def __init__(self):
        """Initialize data cleaner with patterns and rules"""
        # HTML tags pattern
        self.html_pattern = re.compile(r'<[^>]+>')
        
        # URL pattern
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        
        # Email pattern
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        
        # Multiple whitespace pattern
        self.whitespace_pattern = re.compile(r'\s+')
        
        # Political entities (Peru-specific)
        self.political_entities = {
            'parties': [
                'peru libre', 'fuerza popular', 'alianza para el progreso', 'accion popular',
                'renovacion popular', 'avanza pais', 'podemos peru', 'frente amplio',
                'partido aprista peruano', 'pap', 'democracia directa', 'victoria nacional'
            ],
            'institutions': [
                'congreso', 'presidencia', 'pcm', 'onpe', 'jne', 'reniec', 'sunat',
                'contraloria', 'defensoria del pueblo', 'tribunal constitucional'
            ],
            'positions': [
                'presidente', 'vicepresidente', 'ministro', 'congresista', 'alcalde',
                'gobernador', 'premier', 'secretario general'
            ]
        }
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Remove HTML tags
        text = self.html_pattern.sub('', text)
        
        # Remove URLs
        text = self.url_pattern.sub('', text)
        
        # Remove email addresses
        text = self.email_pattern.sub('', text)
        
        # Normalize unicode characters
        text = unicodedata.normalize('NFKD', text)
        
        # Remove extra whitespace
        text = self.whitespace_pattern.sub(' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def extract_political_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract political entities from text"""
        if not text:
            return {}
        
        text_lower = text.lower()
        found_entities = {}
        
        for category, entities in self.political_entities.items():
            found = []
            for entity in entities:
                if entity in text_lower:
                    found.append(entity)
            
            if found:
                found_entities[category] = found
        
        return found_entities
    
    def normalize_social_post(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize social media post data"""
        normalized = {}
        
        # Clean content
        if 'content' in post_data:
            normalized['content'] = self.clean_text(post_data['content'])
        
        # Normalize engagement metrics
        if 'engagement' in post_data:
            normalized['engagement_metrics'] = self._normalize_engagement(post_data['engagement'])
        
        # Extract mentions and hashtags
        if 'content' in post_data:
            normalized['mentions'] = self._extract_mentions(post_data['content'])
            normalized['hashtags'] = self._extract_hashtags(post_data['content'])
        
        return {**post_data, **normalized}
    
    def clean_government_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and structure government data"""
        if not isinstance(data, dict):
            return data
        
        cleaned = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                cleaned[key] = self.clean_text(value)
            elif isinstance(value, dict):
                cleaned[key] = self.clean_government_data(value)
            elif isinstance(value, list):
                cleaned[key] = [
                    self.clean_text(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                cleaned[key] = value
        
        return cleaned
    
    def deduplicate_by_similarity(self, texts: List[str], threshold: float = 0.8) -> List[int]:
        """
        Find duplicate texts based on similarity
        Returns indices of texts to keep
        """
        if not texts:
            return []
        
        # Simple implementation using string matching
        # In production, you might want to use more sophisticated methods
        unique_indices = []
        seen_texts = set()
        
        for i, text in enumerate(texts):
            normalized = self.clean_text(text).lower()
            if normalized not in seen_texts:
                seen_texts.add(normalized)
                unique_indices.append(i)
        
        return unique_indices
    
    def _normalize_engagement(self, engagement: Dict[str, Any]) -> Dict[str, int]:
        """Normalize engagement metrics to consistent format"""
        normalized = {}
        
        # Common engagement metric mappings
        metric_mappings = {
            'likes': ['likes', 'like_count', 'favorite_count'],
            'shares': ['shares', 'share_count', 'retweet_count'],
            'comments': ['comments', 'comment_count', 'reply_count'],
            'views': ['views', 'view_count', 'impression_count']
        }
        
        for standard_key, possible_keys in metric_mappings.items():
            for key in possible_keys:
                if key in engagement:
                    try:
                        normalized[standard_key] = int(engagement[key])
                        break
                    except (ValueError, TypeError):
                        continue
        
        return normalized
    
    def _extract_mentions(self, text: str) -> List[str]:
        """Extract @mentions from text"""
        if not text:
            return []
        
        mention_pattern = re.compile(r'@(\w+)')
        mentions = mention_pattern.findall(text)
        return list(set(mentions))  # Remove duplicates
    
    def _extract_hashtags(self, text: str) -> List[str]:
        """Extract #hashtags from text"""
        if not text:
            return []
        
        hashtag_pattern = re.compile(r'#(\w+)')
        hashtags = hashtag_pattern.findall(text)
        return list(set(hashtags))  # Remove duplicates
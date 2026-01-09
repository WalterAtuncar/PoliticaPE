from typing import Optional, List
import logging
import re

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        self.positive_words = [
            "bueno", "excelente", "mejor", "éxito", "logro", "avance", "progreso",
            "apoyo", "beneficio", "solución", "mejora", "desarrollo", "crecimiento",
            "positivo", "favorable", "esperanza", "confianza", "victoria", "triunfo",
            "acuerdo", "aprobación", "celebración", "felicitaciones", "gracias",
            "importante", "necesario", "valioso", "histórico", "extraordinario",
            "bien", "correcto", "justo", "transparente", "honesto", "eficiente"
        ]
        
        self.negative_words = [
            "malo", "peor", "fracaso", "corrupción", "escándalo", "crisis",
            "problema", "conflicto", "rechazo", "protesta", "denuncia", "crítica",
            "negativo", "desfavorable", "preocupación", "amenaza", "riesgo",
            "derrota", "pérdida", "error", "fallo", "violación", "abuso",
            "injusticia", "ilegal", "fraude", "mentira", "engaño", "traición",
            "robo", "delito", "crimen", "violencia", "muerte", "accidente",
            "mal", "incorrecto", "corrupto", "ineficiente", "incompetente"
        ]
        
        self.intensifiers = ["muy", "mucho", "demasiado", "extremadamente", "totalmente"]
        self.negators = ["no", "nunca", "jamás", "sin", "tampoco", "ni"]
        
        logger.info("SentimentAnalyzer inicializado (análisis basado en reglas)")
    
    def analyze(self, text: str) -> Optional[float]:
        return self.analyze_text(text)
    
    def analyze_text(self, text: str) -> Optional[float]:
        if not text:
            return None
        
        try:
            text_lower = text.lower()
            words = re.findall(r'\b\w+\b', text_lower)
            
            if not words:
                return 0.0
            
            positive_count = 0
            negative_count = 0
            
            for i, word in enumerate(words):
                is_negated = False
                if i > 0 and words[i-1] in self.negators:
                    is_negated = True
                
                intensity = 1.0
                if i > 0 and words[i-1] in self.intensifiers:
                    intensity = 1.5
                
                if word in self.positive_words:
                    if is_negated:
                        negative_count += intensity
                    else:
                        positive_count += intensity
                elif word in self.negative_words:
                    if is_negated:
                        positive_count += intensity * 0.5
                    else:
                        negative_count += intensity
            
            total = positive_count + negative_count
            if total == 0:
                return 0.0
            
            sentiment = (positive_count - negative_count) / total
            return max(-1.0, min(1.0, sentiment))
            
        except Exception as e:
            logger.error(f"Error analizando sentimiento: {e}")
            return None
    
    def analyze_batch(self, texts: List[str]) -> List[Optional[float]]:
        return [self.analyze_text(text) for text in texts]

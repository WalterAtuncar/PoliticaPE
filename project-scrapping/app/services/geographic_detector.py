import re
from typing import Optional, Dict, List
import json

class GeographicDetector:
    def __init__(self):
        """Initialize geographic detection with Peru ubigeo codes"""
        self.peru_regions = {
            'amazonas': '01', 'ancash': '02', 'apurimac': '03', 'arequipa': '04',
            'ayacucho': '05', 'cajamarca': '06', 'callao': '07', 'cusco': '08',
            'huancavelica': '09', 'huanuco': '10', 'ica': '11', 'junin': '12',
            'la libertad': '13', 'lambayeque': '14', 'lima': '15', 'loreto': '16',
            'madre de dios': '17', 'moquegua': '18', 'pasco': '19', 'piura': '20',
            'puno': '21', 'san martin': '22', 'tacna': '23', 'tumbes': '24', 'ucayali': '25'
        }
        
        # Major cities
        self.major_cities = {
            'lima', 'arequipa', 'trujillo', 'chiclayo', 'piura', 'cusco', 'iquitos',
            'huancayo', 'tacna', 'ica', 'puno', 'cajamarca', 'ayacucho', 'huanuco',
            'pucallpa', 'tarapoto', 'tumbes', 'moquegua', 'abancay', 'cerro de pasco'
        }
        
        # Compile regex patterns
        self.region_pattern = re.compile(
            r'\b(' + '|'.join(self.peru_regions.keys()) + r')\b',
            re.IGNORECASE
        )
        
        self.city_pattern = re.compile(
            r'\b(' + '|'.join(self.major_cities) + r')\b',
            re.IGNORECASE
        )
        
        # Ubigeo pattern (6 digits)
        self.ubigeo_pattern = re.compile(r'\b\d{6}\b')
    
    def detect_location(self, text: str) -> Optional[str]:
        """
        Detect geographic location from text
        Returns ubigeo code or location name if found
        """
        if not text:
            return None
        
        text_lower = text.lower()
        
        # Check for ubigeo codes first
        ubigeo_matches = self.ubigeo_pattern.findall(text)
        if ubigeo_matches:
            return ubigeo_matches[0]  # Return first found ubigeo
        
        # Check for regions
        region_matches = self.region_pattern.findall(text_lower)
        if region_matches:
            region = region_matches[0].lower()
            return f"{self.peru_regions[region]}0000"  # Regional ubigeo
        
        # Check for cities
        city_matches = self.city_pattern.findall(text_lower)
        if city_matches:
            return city_matches[0].lower()  # Return city name
        
        return None
    
    def extract_all_locations(self, text: str) -> List[Dict[str, str]]:
        """Extract all geographic references from text"""
        locations = []
        
        if not text:
            return locations
        
        text_lower = text.lower()
        
        # Extract ubigeo codes
        ubigeo_matches = self.ubigeo_pattern.findall(text)
        for ubigeo in ubigeo_matches:
            locations.append({
                'type': 'ubigeo',
                'value': ubigeo,
                'confidence': 1.0
            })
        
        # Extract regions
        region_matches = self.region_pattern.finditer(text_lower)
        for match in region_matches:
            region = match.group().lower()
            locations.append({
                'type': 'region',
                'value': region,
                'ubigeo': f"{self.peru_regions[region]}0000",
                'confidence': 0.9
            })
        
        # Extract cities
        city_matches = self.city_pattern.finditer(text_lower)
        for match in city_matches:
            city = match.group().lower()
            locations.append({
                'type': 'city',
                'value': city,
                'confidence': 0.8
            })
        
        return locations
    
    def get_region_name(self, ubigeo: str) -> Optional[str]:
        """Get region name from ubigeo code"""
        if len(ubigeo) < 2:
            return None
        
        region_code = ubigeo[:2]
        for region, code in self.peru_regions.items():
            if code == region_code:
                return region.title()
        
        return None
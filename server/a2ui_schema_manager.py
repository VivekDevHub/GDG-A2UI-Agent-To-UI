"""Google A2UI Schema Manager."""

from typing import List, Dict, Any, Optional

class A2uiSchemaManager:
    """Manages A2UI schema versions, component catalog definitions, and message builders."""

    def __init__(
        self,
        version: str = "0.9",
        catalogs: Optional[List[str]] = None,
    ):
        self.version = version
        self.catalogs = catalogs or [
            "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
        ]

    @property
    def primary_catalog(self) -> str:
        return self.catalogs[0] if self.catalogs else "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"

    def create_surface_message(
        self,
        surface_id: str,
        catalog_id: Optional[str] = None,
        theme: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Creates an A2UI createSurface message."""
        return {
            "version": f"v{self.version}",
            "createSurface": {
                "surfaceId": surface_id,
                "catalogId": catalog_id or self.primary_catalog,
                "theme": theme or { "primaryColor": "#DA291C", "font": "Google Sans" }
            }
        }

    def update_components_message(
        self,
        surface_id: str,
        components: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Creates an A2UI updateComponents message."""
        return {
            "version": f"v{self.version}",
            "updateComponents": {
                "surfaceId": surface_id,
                "components": components,
            }
        }

    def update_data_model_message(
        self,
        surface_id: str,
        value: Dict[str, Any],
        path: str = "/",
    ) -> Dict[str, Any]:
        """Creates an A2UI updateDataModel message."""
        return {
            "version": f"v{self.version}",
            "updateDataModel": {
                "surfaceId": surface_id,
                "path": path,
                "value": value,
            }
        }

    def build_surface_payload(
        self,
        surface_id: str,
        components: List[Dict[str, Any]],
        data_model: Dict[str, Any],
        catalog_id: Optional[str] = None,
        theme: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Convenience method to construct all 3 standard A2UI messages."""
        return [
            self.create_surface_message(surface_id, catalog_id=catalog_id, theme=theme),
            self.update_components_message(surface_id, components),
            self.update_data_model_message(surface_id, data_model),
        ]

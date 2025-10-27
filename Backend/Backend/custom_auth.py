from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that exempts CSRF for API endpoints
    """
    def enforce_csrf(self, request):
        # Skip CSRF enforcement for API endpoints
        return

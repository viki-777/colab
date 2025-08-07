import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except auth pages, api/auth, and static files
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|public).*)",
  ]
};

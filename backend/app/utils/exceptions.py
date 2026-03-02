from fastapi import HTTPException, status

class AppException(HTTPException):
    def __init__(self, status_code: int, code: str, detail: str):
        super().__init__(status_code=status_code, detail={"code": code, "detail": detail})

class DuplicatePhoneException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DUPLICATE_PHONE",
            detail="Phone number already registered"
        )

class DuplicateEmailException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DUPLICATE_EMAIL",
            detail="Email already registered"
        )

class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
            detail="Invalid phone or password"
        )

class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="USER_NOT_FOUND",
            detail="User not found"
        )

class BookingNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="BOOKING_NOT_FOUND",
            detail="Booking not found"
        )

class InvalidOTPException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_OTP",
            detail="Invalid or expired OTP"
        )

class UnauthorizedActionException(AppException):
    def __init__(self, detail: str = "You are not authorized to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="UNAUTHORIZED_ACTION",
            detail=detail
        )

import logging
from pathlib import Path
from dotenv import load_dotenv

import os

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]
# CORS_ALLOW_HEADERS = ['*']

CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:8000/", "http://localhost:5173/", "http://localhost:5174/"]

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = ["*"]
CORS_ALLOW_METHODS = (
    "GET",
    "POST",
)

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "logic",
    "rest_framework",
    "corsheaders",
    "mobile_invent",
    "it_invent",
    "api",
    "it_inventory_management",
    "equipment_editing_single",
    "equipment_editing_group",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates", BASE_DIR / "frontend"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
            "builtins": ["templatetags.templatetags"],
        },
    },
]

# STATICFILES_DIRS = [
#     BASE_DIR / "static",
# ]

WSGI_APPLICATION = "core.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = "static/"
# STATICFILES_DIRS = [
#     BASE_DIR / "static",
# ]

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {"DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",)}

# LOGS
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "[{asctime}] >> {message}",
            "style": "{",
        },
        "complex": {
            "format": "[{asctime}] #{levelname:8} {filename}:{lineno} - {name} - {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/mobile_invent.log",
            "formatter": "simple",
            "encoding": "utf8",
        },
        "jira": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/jira.log",
            "formatter": "simple",
        },
        "it_invent_mng": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/it_invent_mng.log",
            "formatter": "simple",
            "encoding": "utf8",
        },
        "single_edit": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/single_edit.log",
            "formatter": "simple",
            "encoding": "utf8",
        },
        "group_edit": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/group_edit.log",
            "formatter": "simple",
            "encoding": "utf8",
        },
    },
    "loggers": {
        "main": {
            "handlers": ["file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "jira": {
            "handlers": ["jira"],
            "level": "DEBUG",
            "propagate": True,
        },
        "it_invent_mng": {
            "handlers": ["it_invent_mng"],
            "level": "DEBUG",
            "propagate": True,
        },
        "single_edit": {
            "handlers": ["single_edit"],
            "level": "DEBUG",
            "propagate": True,
        },
        "group_edit": {
            "handlers": ["group_edit"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Sessions
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SAVE_EVERY_REQUEST = True


# variables
IDAM_CLIENT_ID = os.getenv("IDAM_CLIENT_ID")
IDAM_CLIENT_SECRET = os.getenv("IDAM_CLIENT_SECRET")

# AUTH_USER_MODEL = "users.ToolUser"

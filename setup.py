from setuptools import setup

setup(
    name="tridyme-cli",
    version="0.1.0",
    py_modules=["tridyme-cli"],
    install_requires=[
        "requests>=2.25.0",
    ],
    entry_points={
        "console_scripts": [
            "tridyme-cli=tridyme-cli:main",
        ],
    },
    author="TridymeSDK",
    author_email="contact@tridyme.com",
    description="CLI pour la gestion simplifié des applications TridymeSDK",
    keywords="tridyme, sdk, cli",
    url="https://tridyme.com/",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
)

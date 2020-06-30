**dstack is an open-source framework for Python and R for managing data science artifacts, and for building data science applications.**

How is dstack different from other frameworks:
 - It is designed for data scientists and doesn't require development skills to build applications.   
 - It simplifies the process of creating applications by leveraging a) a declarative approach to defining application components; b) a tight integration with data science frameworks and tools.

The key features of dstack:
- Managing data science artifacts (e.g. tracking revisions of datasets, pushing and pulling datasets)
- Building data science applications (this currently includes dashboards and reports; the support for ML models is coming soon) 

## How dstack works

The framework consists of the following parts:
- Client packages for Python ([dstack-py](https://github.com/dstackai/dstack-py)) an R ([dstack-r](https://github.com/dstackai/dstack-r)). These packages can be used from either notebooks or scripts to push data to dstack.
- A server application ([dstack-server](https://github.com/dstackai/dstack-server)). It handles the requests from the Client packages, and serve data applications. The application can run locally or in Docker.  

There are two general use-cases for dstack:

### Use case #1: Managing data science artifacts

The results of a data science process normally may include all kind of datasets, visualizations, ML models, text and binary files, etc. 

The `dstack-server` application serves as a storage engine to store these artifacts and track their revisions and meta-data.
The `dstack-py` and `dstack-r` packages provides the capabilities to push and pull these artifacts to and from the corresponding instance of `dstack-server`.

The dstack framework uses the following abstractions to represent artifacts:

- A *Stack* has a human-readable name (*Stack Name*), the ID of its latest frame (*Frame* or *Stack Head*), and the name of the user it belongs to (*User*) 
- A *Frame* represents a unique revision of a *Stack*. It has a unique ID (*Frame ID*), a human-readable description (*Frame Description*),and a set of *Attachments*.  
- An *Attachment* has a data (*Attachment Data*) which can be either plain or binary, a MIME type of the data (*Attachment Content Type*),
   an application name which can interpret this type of data (*Attachment Application*), 
   and most importantly a key/value dictionary with the metadata associated with the *Attachment* (*Attachment Params*).
- A *User* has a human-readable name (*Username*), and a secret token for authorization (*User Token*).
- A *User Profile* has a human readable name (*Profile Name*), a *Username*, a *User Token*, and the URL of the server API (*Server URL*). 
    User profiles are configured locally to authorize the requests from the `dstack` packages.
   
The workflow in this case is the following:

- Install the `dstack` package (e.g. via `pip` or `conda`)
- Run `dstack-server` (e.g. using the `dstack server` dstack CLI command)
- Configure a dstack profile (e.g. using the `dstack config` dstack CLI command) 
- Push or pull *Stack Frames* from Jupyter notebooks, Rmarkdown files or any Python or R scripts. Pushing and pulling is done via the `dstack` packages for Python or R. 

### Use case #2: Building data science applications

A data science application is a specific kind of applications that solves domain-specific problems by leveraging data and data-science methods.
 These methods may include data-wrangling, visualizations, statistical modeling, machine learning, etc.  

There are several general use-cases for such data science applications:

1. Dashboards
2. Reports
3. Machine learning prototypes

In order to simplify the process of building data science applications (and entirely remove the need for development skills),
    the framework builds on the engine for managing artifacts, described above, and offers data scientists a way to build
    applications by combining already submitted artifacts (*Stacks*). In this case, data science applications are built
    automatically on-the-fly based on the chosen artifacts, and the logic defined through a declarative approach.
    
Currently, dstack supports only simple types of applications, such as interactive dashboards and data reports. 
    Soon, it's going to also support machine learning models, and custom callbacks.
    
TBA     

## Installation

The `dstack` package can be easily installed via either pip or conda:

```bash
pip install dstack
```

```bash
conda install dstack -c dstack.ai
```

The package comes with a command line tool called `dstack`. This command line tool can be used to configure local profiles, credentials, and to run a local server. 

If you're using R and don't need the command line tool, you can install the `dstack` package for R via the following command:

```R
install.packages("dstack")
```

## Quick start

### Run a server

TBA

### Configure a user profile

TBA

### Push artifacts

TBA

### Pull artifacts

TBA

### Building dashboards

TBA

## Roadmap

TBA

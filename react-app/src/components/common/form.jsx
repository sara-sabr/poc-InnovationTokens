import React, { Component } from "react";
import Joi from "joi-browser";
import _ from "lodash";
import Input from "./input";
import Checkbox from "./checkbox";
import Search from "./search";

class Form extends Component {
  state = { data: {}, errors: {} };

  validate = () => {
    const errors = {};
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);

    if (!error) return errors;

    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors });
    if (!_.isEmpty(errors)) return;

    this.doSubmit();
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  renderButton(label) {
    return (
      <button
        disabled={!_.isEmpty(this.validate())}
        className="ui button primary"
      >
        {label}
      </button>
    );
  }

  renderSearch(name, label, placeholder, options) {
    const { data, errors } = this.state;

    return (
      <Search
        name={name}
        value={data[name]}
        label={label}
        options={options}
        placeholder={placeholder}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderCheckbox(name, label) {
    return <Checkbox name={name} label={label} />;
  }

  renderInput(name, label, type = "text") {
    const { data, errors } = this.state;

    return (
      <Input
        type={type}
        name={name}
        value={data[name]}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }
}

export default Form;

import React, { Component } from 'react'
import "./Cal.css"
export default class Calculator extends Component {

    state={
        result:"",
     }

    buttonClicked = (val)=>{
        this.setState({result:this.state.result+val})
    }

    // This Function Will Be Called When "="  is Clicked
    evaluate = (str)=>{
        var reg = /[*/+-]/
        if(str.match(reg)){
          var val = ''
          for(let i = 0; i < str.length; i++){
            if(str[i] === '+') {
              return parseInt(val) + this.evaluate(str.substring(i+1))
            }
            else if(str[i] === '-') {
              return parseInt(val) - this.evaluate(str.substring(i+1))
            }
            else if(str[i] === '*') {
              return parseInt(val) * this.evaluate(str.substring(i+1))
            }
            else if(str[i] === '/') {
              return parseInt(val) / this.evaluate(str.substring(i+1))
            }
            else {
              val += str[i]
            }
          }
        }
        else {
          return parseInt(str)
        }
      }

    clearTextField = ()=>{
        this.setState({result:""})
    }

    calculate = ()=>{
        this.setState({result:this.evaluate(this.state.result)})
    }

    render() {
        return (
            <>
                <table border="1">
                    <thead></thead>
                    <tbody>
                    <tr>
                        <td colSpan={4} className="result_field"><input className="result" type="text" value={this.state.result}></input></td>
                    </tr>
                    <tr>
                    <td colSpan={3}><input type="button" className="btn" onClick={()=>this.clearTextField()} value="C"></input></td>
                    <td className="operator_btn"><input type="button" className="btn" onClick={()=>this.buttonClicked('+')} value="+"></input></td>    
                    </tr>
                    <tr>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('7')} value="7"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('8')} value="8"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('9')} value="9"></input></td>
                    <td className="operator_btn"><input type="button" className="btn" onClick={()=>this.buttonClicked('-')} value="-"></input></td>    
                    </tr>
                    <tr>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('4')} value="4"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('5')} value="5"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('6')} value="6"></input></td>
                    <td className="operator_btn"><input type="button" className="btn" onClick={()=>this.buttonClicked('/')} value="/"></input></td>
                    </tr>
                    <tr>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('1')} value="1"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('2')} value="2"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('3')} value="3"></input></td>
                    <td className="operator_btn"><input type="button" className="btn" onClick={()=>this.buttonClicked('*')} value="*"></input></td>
                    </tr>
                    <tr>
                    <td colSpan={2}><input type="button" className="btn" onClick={()=>this.buttonClicked('0')} value="0"></input></td>
                    <td><input type="button" className="btn" onClick={()=>this.buttonClicked('.')} value="."></input></td>
                    <td className="operator_btn"><input type="button" className="btn" onClick={()=>this.calculate()} value="="></input></td>
                    </tr>
                    </tbody>
                </table>
            </>
        )
    }
}


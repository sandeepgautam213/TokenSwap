import React,{useEffect, useState} from 'react'
import TokenSwap from "../contracts/TokenSwap.json";

export default function Admin({Web3,Contracts,Accounts,TokenSwapAddress}) {
    const [ratio, setRatio] = useState(0);
    const [numOfTokenA, setNumOfTokenA] = useState(0);
    const [numOfTokenX, setNumOfTokenX] = useState(0);
    const [fees, setFees]= useState(0);
    const [tokenABalance, setTokenABalance] = useState(0);
    const [tokenXBalance, setTokenXBalance] = useState(0);
    const [abcTokenPrice, setabcTokenPrice] = useState(0);
    const [xyzTokenPrice, setXyzTokenPrice] = useState(0);

    const updateBalance = async () => {
      if (Contracts && Contracts.length >= 3) { // Ensure Contracts array exists and has at least 3 elements
        try {
          const result1 = await Contracts[1].methods.balanceOf(TokenSwapAddress).call();
          setTokenABalance(parseInt(result1));
    
          const result2 = await Contracts[2].methods.balanceOf(TokenSwapAddress).call();
          setTokenXBalance(parseInt(result2));
        } catch (error) {
          console.error("Error updating balance:", error);
        }
      } else {
        console.error("Contracts array is not properly initialized.");
      }
    };
    
    useEffect(() => {
      const fetchData = async () => {
        await updateBalance();
        
        Contracts[1].events.Transfer({ fromBlock: 0, filter: { _from: Accounts[0], _to: TokenSwapAddress } }, (error, event) => {
          updateBalance();
        });
    
        Contracts[2].events.Transfer({ fromBlock: 0, filter: { _from: Accounts[0], _to: TokenSwapAddress } }, (error, event) => {
          updateBalance();
        });
    
        const abcPrice = await Contracts[1].methods.tokenPrice().call();
        setabcTokenPrice(abcPrice);
    
        const xyzPrice = await Contracts[2].methods.tokenPrice().call();
        setXyzTokenPrice(xyzPrice);
    
        const result = await Contracts[0].methods.getRatio().call();
        setRatio(result);
    
        const result2 = await Contracts[0].methods.getFees().call();
        setFees(result2);
      };
    
      fetchData();
    
      const receipt = Contracts[1].events.Transfer({ fromBlock: 0, filter: { _from: Accounts[0], _to: TokenSwapAddress } }, (error, event) => {
        updateBalance();
      });
    
      const receipt2 = Contracts[2].events.Transfer({ fromBlock: 0, filter: { _from: Accounts[0], _to: TokenSwapAddress } }, (error, event) => {
        updateBalance();
      });
    
      return () => {
        receipt.unsubscribe();
        receipt2.unsubscribe();
      };
    }, []);
    


    const  buyTokensABC = async (value)=>
    {
        await Contracts[0].methods.buyTokensABC(value).send({from:Accounts[0],value:abcTokenPrice*value});
    } 
    const buyTokensXYZ = async (value)=>
    {
        await Contracts[0].methods.buyTokensXYZ(value).send({from:Accounts[0],value:xyzTokenPrice*value});
    }
    const changeFees= async (value)=>
    {
        await Contracts[0].methods.setFees(value).send({from:Accounts[0]});
        const result = await Contracts[0].methods.getFees().call();
        setFees(result);
    }

    const changeRatio =async (value)=>
    {
        await Contracts[0].methods.setRatio(value).send({from:Accounts[0]});
        const result = await  Contracts[0].methods.getRatio().call();
        setRatio(result);  
    }


    return (
        <div className="container">
        <div className="mt-2 d-flex justify-content-center align-items-center navbar rounded bg-warning ">
        <p className="h2 text-white">Admin panel</p></div>
        <form onSubmit={(evt)=>
                {
                    evt.preventDefault();
                    changeFees(evt.target.fees.value);
                    evt.target.fees.value="";
                }}>
            <label className="mt-3 alert alert-info">fees: {fees}%</label> 
            <div className="input-group">
                <input name="fees" type="number"  className="text-center form-control"  placeholder="Fees" min="1" ></input>
                <button className="btn-primary form-control" type="submit" /*onClick={(evt)=>{/*changeFees()}*/>Set Fees</button> 
            </div>
        </form>
        <form onSubmit={(evt)=>
                {
                    evt.preventDefault();
                    changeRatio(evt.target.ratio.value);
                    evt.target.ratio.value="";
                }}>
            <label className ="mt-3 alert alert-info">Ratio: {ratio}</label>
            <div className="input-group">
                <input type="number"  name="ratio" className="text-center form-control" placeholder="Ratio"></input>
                <button className="btn-primary form-control" type="submit">Set Ratio</button> 
            </div>
        </form>
        <form onSubmit={(evt)=>
                {
                    evt.preventDefault();
                    buyTokensABC(evt.target.tokenABCAmount.value);
                    evt.target.tokenABCAmount.value="";
                }}>
            <label className="mt-3 alert alert-info">Tokens ABC bought:{tokenABalance}</label>
            <div className="input-group">
                <input type="number"  name="tokenABCAmount" className="text-center form-control" max="5000" placeholder="Amount"></input>
                <button className="btn-danger form-control" type="submit">Buy TokenABC</button> 
            </div>
        </form>
        <form onSubmit={(evt)=>
                {
                    evt.preventDefault();
                    buyTokensXYZ(evt.target.tokenXYZAmount.value);
                    evt.target.tokenXYZAmount.value="";
                }}>
            <label className="mt-3 alert alert-info">Tokens XYZ bought:{tokenXBalance}</label>   
            <div className="input-group">
                <input type="number" name="tokenXYZAmount" className="text-center form-control" placeholder="Amount"></input>
                <button className="btn-danger form-control" type="submit">Buy TokenXYZ</button> 
            </div>
        </form>
        </div>
    )
}
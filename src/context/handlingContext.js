import noteContext from './noteContext';
import * as SQLite from 'expo-sqlite';

const reducer = (state,action) =>{
    switch(action.type){
        case 'save_table':
            return [action.payload]
        default:
            return state 
    }
};

const save_Table = (dispatch)=>{
    return (t_name,id,slide,title,content,callBack)=>{
        dispatch({type:'save_table',payload:{t_name,id,slide,title,content}})
        if(callBack){
            callBack();
        }
    };
};

const db=SQLite.openDatabase("GroceryDB");

const insert_table = () =>{  
    return (t_name,id,name,content) =>{
        db.transaction(
            (tx)=>{
                tx.executeSql(`select * from ${t_name} where item_id=?`,[id],(tx,result)=>{
                    if (content!==''){
                        if(result.rows.length>0){
                            
                            tx.executeSql(`update ${t_name} set item_name=?,content=? where item_id=?`,[name,content,id],(tx,result)=>{},(err)=>{console.log('Update error=',err)});
                        }
                        else{
                            
                            tx.executeSql(`insert into ${t_name} values(?,?,?,?)`,[id,name,content,false]);
                        }
                    }
                    else{
                        tx.executeSql(`delete from ${t_name} where item_id=?`,[id]);
                    }
                },(err)=>{console.log('insert error2=',err)})
            },(err)=>{console.log("insert error 1=",err)},()=>{console.log('Success')}
        );
    };
};

const update_language = () => {
    return (id,language)=>{
        db.transaction((tx)=>{
            tx.executeSql('update notes set language=? where id=?',[language,id]);
        },(err)=>{console.log("update_language 1=",err)},()=>{console.log('Success')});
    }
};




export const {Context,Provider}=noteContext(
    reducer,
    {save_Table,insert_table,update_language},
    []
);
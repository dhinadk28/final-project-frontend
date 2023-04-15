import { Fragment, useEffect } from "react"
import { Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { deleteOrder, adminOrders as adminOrdersAction } from "../../actions/orderActions"
import { clearError, clearOrderDeleted } from "../../slices/orderSlice"
import Loader from '../layouts/Loader';
import { MDBDataTable} from 'mdbreact';
import {toast } from 'react-toastify'
import Sidebar from "./Sidebar"
import jsPDF from 'jspdf'
import 'jspdf-autotable' 


export default function OrderList() {
    const { adminOrders = [], loading = true, error, isOrderDeleted }  = useSelector(state => state.orderState)

    const dispatch = useDispatch();

    const setOrders = () => {
        const data = {
            columns : [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Product Names',
                    field: 'productNames',
                    sort: 'asc'
                },
                {
                    label: 'Number of Items',
                    field: 'noOfItems',
                    sort: 'asc'
                },
                {
                    label: 'Amount',
                    field: 'amount',
                    sort: 'asc'
                },
                
                {
                    label: 'Status',
                    field: 'status',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                    sort: 'asc'
                }
            ],
            rows : []
        }
    
        adminOrders.forEach( order => {
            let productNames = order.orderItems.map(item => item.name).join(", ");
            data.rows.push({
                id: order._id,
                noOfItems: order.orderItems.length,
                amount : `₹${order.totalPrice}`,
                productNames: productNames,
                status: <p style={{color: order.orderStatus.includes('Processing') ? 'red' : 'green'}}>{order.orderStatus}</p> ,
                actions: (
                    <Fragment>
                        <Link to={`/admin/order/${order._id}`} className="btn btn-primary"> <i className="fa fa-pencil"></i></Link>
                        <Button onClick={e => deleteHandler(e, order._id)} className="btn btn-danger py-1 px-2 ml-2">
                            <i className="fa fa-trash"></i>
                        </Button>
                    </Fragment>
                )
            })
        })
    
        return data;
    }
    
    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteOrder(id))
    }

    useEffect(() => {
        if(error) {
            toast(error, {
                position: toast.POSITION.BOTTOM_CENTER,
                type: 'error',
                onOpen: ()=> { dispatch(clearError()) }
            })
            return
        }
        if(isOrderDeleted) {
            toast('Order Deleted Succesfully!',{
                type: 'success',
                position: toast.POSITION.BOTTOM_CENTER,
                onOpen: () => dispatch(clearOrderDeleted())
            })
            return;
        }

        dispatch(adminOrdersAction)
    },[dispatch, error, isOrderDeleted])
    const exportPDF = () => {
        // Initialize the PDF document
        const doc = new jsPDF();
      
        // Set the company name and address
        doc.setFontSize(18);
        doc.text('SRI VVB ENTERPRISES', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('10,INDUSTRIAL ESTATE HOSUR', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        doc.setFontSize(12);
        doc.text('ORDER LIST', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
        // Add the date and time
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        doc.text(`Date: ${formattedDate}`, 14, 60);
      
        // Get the order data
        const orders = adminOrders.map(order => {
          const productNames = order.orderItems.map(item => item.name).join(', ');
          const totalPrice = `${order.totalPrice}`;
          const status = order.orderStatus;
          return [order._id, productNames, order.orderItems.length, totalPrice, status];
        });
      
        // Add the ordered list to the PDF document
        doc.autoTable({
          startY: 70,
          head: [['ID', 'Product Names', 'Number of Items', 'Amount', 'Status']],
          body: orders,
          didDrawPage: function (data) {
            // Add a signature at the bottom of the PDF document
            doc.text('Authorized Signature', doc.internal.pageSize.getWidth() - 70, doc.internal.pageSize.getHeight() - 20);
          }
        });
      
        // Save the PDF document
        doc.save('order-list.pdf');
      };
      


    return (
        <div className="row">
        <div className="col-12 col-md-2">
                <Sidebar/>
        </div>
        <div className="col-12 col-md-10">
            <h1 className="my-4">Order List</h1>
            <Button variant="primary" onClick={exportPDF}>
  Export as PDF
</Button>

            <Fragment>
                {loading ? <Loader/> : 
                    <MDBDataTable
                        data={setOrders()}
                        bordered
                        striped
                        hover
                        className="px-3"
                    />
                }
            </Fragment>
        </div>
    </div>
    )
}